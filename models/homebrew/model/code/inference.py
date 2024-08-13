import os
import torch
from tokenizers import Tokenizer
import json
import model
import torch.nn.functional as F

def model_fn(model_dir):
    hyperparameters_path = os.path.join(model_dir, 'hyperparameters.json')
    with open(hyperparameters_path, 'r') as f:
        hyperparameters = json.load(f)

    d_model = hyperparameters['d_model']
    num_heads = hyperparameters['num_heads']
    num_layers = hyperparameters['num_layers']
    dropout = hyperparameters['dropout']
    vocab_size = hyperparameters['vocab_size']
    max_len = hyperparameters['max_len']

    model = model.GPT(vocab_size, d_model, num_heads, num_layers, max_len, dropout)
    model_path = os.path.join(model_dir, 'model.pth')
    model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
    model.eval()

    tokenizer_path = os.path.join(model_dir, 'tokenizer.json')
    tokenizer = Tokenizer.from_file(tokenizer_path)

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    print(f"Model loaded on {device}.")

    return model, tokenizer


def input_fn(request_body, content_type='application/json'):
    print(f"Request Body: {request_body}")
    print(f"Content Type: {content_type}")
    if content_type == 'application/json':
        return json.loads(request_body)
    raise ValueError(f"Unsupported content type: {content_type}")


def predict_fn(input_data, model_tokenizer):
    model, tokenizer = model_tokenizer
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    print(f"Input Data: {input_data}")
    user_input = input_data["data"]
    print(f"User Input: {user_input}")

    eos_token_id = 6
    user_input_ids = torch.tensor(tokenizer.encode(user_input).ids).unsqueeze(0).to(device)

    user_input_len = len(user_input_ids[0])
    print(f"Length of Tokenized User Input: {user_input_len}")
    if user_input_len > model.max_len:
        print("User input string is too long")
        return "STRING_TOO_LONG"
    
    generated_response = user_input_ids.clone()
    for _ in range(model.max_len):
        user_mask = model.create_mask(1, generated_response.size(1), [generated_response.size(1)]).to(device)
        
        output_logits = model(generated_response, user_mask)
        probabilities = F.softmax(output_logits[:, -1, :], dim=-1)
        next_token_id = torch.multinomial(probabilities, num_samples=1)
        next_token_id = next_token_id.squeeze(-1).unsqueeze(0)

        generated_response = torch.cat((generated_response, next_token_id), dim=1)

        if next_token_id.item() == eos_token_id or generated_response.size(1) == model.max_len:
            break
    
    generated_tokens = generated_response[0].tolist()
    print(f"Generate Tokenized Tensor: {generated_tokens} of length {len(generated_tokens)}")
    
    generated_text = tokenizer.decode(generated_tokens[user_input_len:])
    print(f"Generated Model Text: {generated_text}")

    return generated_text
    

def output_fn(prediction, content_type='application/json'):
    if content_type == 'application/json':
        if prediction == "STRING_TOO_LONG":
            return json.dumps({"error": "The input string is too long."})
        return json.dumps({"generated_text": prediction})
    else:
        raise ValueError(f"Unsupported content type: {content_type}")
