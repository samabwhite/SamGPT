import pandas as pd
import os
from datetime import datetime
import json

import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
from torch.utils.data import Dataset

from tokenizers import Tokenizer


EOS_ID = 6

class CSV_Dataset(Dataset):
    def __init__(self, dir, question_dir, tokenizer, data_key, question_key, max_len=None):
        print("Current working directory:", os.getcwd())
        data = pd.read_csv(dir)[data_key]
        questions = pd.read_csv(question_dir)[question_key] if question_dir else None

        tokenized = [torch.tensor(tokenizer.encode(str(sequence)).ids) for sequence in data]
        tokenized = [torch.cat((tensor, torch.tensor([EOS_ID]))) for tensor in tokenized]
        
        self.max_len = max_len if max_len else max([len(seq) for seq in tokenized])

        padded = [F.pad(sequence[:self.max_len], (0, self.max_len-len(sequence[:self.max_len])),value=2) for sequence in tokenized]

        self.train = torch.stack(padded)
        self.question_length = [len(torch.tensor(tokenizer.encode(str(question)[:self.max_len]).ids)) for question in questions]
        self.n_samples = self.train.shape[-2]
    
    def __getitem__(self, index):
        return self.train[index], self.question_length[index]
    
    def __len__(self):
        return self.n_samples
    

class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len):
        super(PositionalEncoding, self).__init__()
        self.d_model = d_model
        self.max_len = max_len

        # Create a positional encoding matrix
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float32).unsqueeze(1)
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-torch.log(torch.tensor(10000.0)) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        pe = pe.unsqueeze(0)

        self.register_buffer('pe', pe)
    
    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
    

class LayerNormalization(nn.Module):
    def __init__(self, d_model):
        super(LayerNormalization, self).__init__()
        self.gamma = nn.Parameter(torch.ones(d_model))
        self.beta = nn.Parameter(torch.zeros(d_model))
    
    def forward(self, x):
        mean = x.mean(dim=-1, keepdim=True)
        std = x.std(dim=-1, keepdim=True)
        x_norm = (x-mean) / (std + 1e-6)
        output = (self.gamma * x_norm) + self.beta
        return output
    

def create_mask(batch_size, seq_length, question_lengths):
    mask = []
    for i in range(batch_size):
        question_length = question_lengths[i] - 1
        casual_mask = torch.tril(torch.ones(seq_length, seq_length), diagonal=question_length)
        casual_mask = torch.ones(casual_mask.shape) - casual_mask
        mask.append(casual_mask)
    
    mask = torch.stack(mask)
    mask = mask.unsqueeze(1) 

    return mask


class MultiHeadMaskedSelfAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super(MultiHeadMaskedSelfAttention, self).__init__()
        
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"
        self.d_model = d_model
        self.num_heads = num_heads
        self.depth = d_model // num_heads
        
        # create Wq, Wk, Wv layers, and final dense layer
        self.wq = nn.Linear(d_model, d_model)
        self.wk = nn.Linear(d_model, d_model)
        self.wv = nn.Linear(d_model, d_model)
        self.dense = nn.Linear(d_model, d_model)
        
    def split_head(self, x, batch_size):
        x = x.view(batch_size, -1, self.num_heads, self.depth)
        return x.transpose(1, 2)
    
    def forward(self, x, mask):
        batch_size = x.size(0)
        
        q = self.split_head(self.wq(x), batch_size)
        k = self.split_head(self.wk(x), batch_size)
        v = self.split_head(self.wv(x), batch_size)
        
        # Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V
        scores = torch.matmul(q, k.transpose(-2, -1)) / torch.sqrt(torch.tensor(self.depth, dtype=torch.float32))
        
        if mask is not None:
            scores += (mask * -1e9)
            
        attention_weights = F.softmax(scores, dim=-1)
        output = torch.matmul(attention_weights, v)

        output = output.transpose(1, 2).contiguous().view(batch_size, -1, self.d_model)
        output = self.dense(output)
        
        return output
    

class ResidualConnection(nn.Module):
    def __init__(self, sublayer):
        super(ResidualConnection, self).__init__()
        self.sublayer = sublayer
    
    def forward(self, x, *args):
        sublayer_output = self.sublayer(x, *args)
        output = x + sublayer_output
        return output
    

class FFNN(nn.Module):
    def __init__(self, d_model, bias=False, dropout=0.2):
        super(FFNN, self).__init__()
        self.c_fc    = nn.Linear(d_model, 4 * d_model, bias=bias)
        self.gelu    = nn.GELU()
        self.c_proj  = nn.Linear(4 * d_model, d_model, bias=bias)
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x):
        x = self.c_fc(x) # [B, T, 4*d]
        x = self.gelu(x)
        x = self.c_proj(x) # [B, T, d]
        x = self.dropout(x)
        return x
    

class DecoderBlock(nn.Module):
    def __init__(self, d_model, num_heads, dropout=0.1):
        super(DecoderBlock, self).__init__()
        self.norm1 = LayerNormalization(d_model)
        self.self_attention = ResidualConnection(MultiHeadMaskedSelfAttention(d_model, num_heads))
        self.norm2 = LayerNormalization(d_model)
        self.ffnn = ResidualConnection(FFNN(d_model))
        self.dropout = nn.Dropout(dropout)
    
    def forward(self, x, mask):
        x = self.norm1(x)
        x = self.self_attention(x, mask)
        x = self.norm2(x)
        x = self.ffnn(x)
        return x
    

class GPT(nn.Module):
    def __init__(self, vocab_size, d_model, num_heads, num_layers, max_len, dropout=0.1):
        super(GPT, self).__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.positional_encoding = PositionalEncoding(d_model, max_len)
        self.layers = nn.ModuleList([DecoderBlock(d_model, num_heads, dropout) for _ in range(num_layers)])
        self.ln_f = LayerNormalization(d_model)
        self.head = nn.Linear(d_model, vocab_size, bias=False)
        self.max_len = max_len
    
    def forward(self, x, mask):
        x = self.embedding(x)
        x = self.positional_encoding(x)
        for layer in self.layers:
            x = layer(x, mask)
        x = self.ln_f(x)
        logits = self.head(x)
        return logits


def save_model(model, optimizer, training_path, d_model, num_heads, num_layers, dropout, vocab_size, max_len, learning_rate, batch_size):
    path = f"{training_path}\\model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    os.makedirs(path)

    model_path = path + "\\model.pth"
    optimizer_path = path + "\\optimizer.pth"
    hyperparameters_path = path + "\\hyperparameters.json"

    torch.save(model.state_dict(), model_path)
    print(f"Model saved to {model_path}")

    torch.save(optimizer.state_dict(), optimizer_path)
    print(f"Optimizer saved to {optimizer_path}")

    hyperparameters = {
        'd_model': d_model,
        'num_heads': num_heads,
        'num_layers': num_layers,
        'dropout': dropout,
        'vocab_size': vocab_size,
        'max_len': max_len,
        'learning_rate': learning_rate,
        'batch_size': batch_size
    }

    with open(hyperparameters_path, 'w') as f:
        json.dump(hyperparameters, f)


def load_model(training_path, model_path):
    model_path = training_path + model_path
    tokenizer_path = training_path + "\\tokenizer.json"
    gpt_path = model_path + "\\model.pth"
    optimizer_path = model_path + "\\optimizer.pth"
    hyperparameters_path = model_path + "\\hyperparameters.json"

    with open(hyperparameters_path, 'r') as f:
        hyperparameters = json.load(f)

    d_model = hyperparameters['d_model']
    num_heads = hyperparameters['num_heads']
    num_layers = hyperparameters['num_layers']
    dropout = hyperparameters['dropout']
    vocab_size = hyperparameters['vocab_size']
    max_len = hyperparameters['max_len']
    learning_rate = hyperparameters['learning_rate']
    batch_size = hyperparameters['batch_size']

    
    model = GPT(vocab_size, d_model, num_heads, num_layers, max_len, dropout)
    model.load_state_dict(torch.load(gpt_path))

    tokenizer = Tokenizer.from_file(tokenizer_path)

    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    optimizer.load_state_dict(torch.load(optimizer_path))

    return {
        'model': model,
        'tokenizer': tokenizer,
        'optimizer': optimizer,
        'hyperparameters': {
            'd_model': d_model,
            'num_heads': num_heads,
            'num_layers': num_layers,
            'dropout': dropout,
            'vocab_size': vocab_size,
            'max_len': max_len,
            'learning_rate': learning_rate,
            'batch_size': batch_size
        }
    }

