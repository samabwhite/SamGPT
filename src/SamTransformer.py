# imports
import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn
import torch.nn.functional as F
from transformers import AdamW

from tokenizers import ByteLevelBPETokenizer

# parameters
VOCAB_SIZE = 30000
MIN_FREQ = 2
BATCH_SIZE = 64
NUM_WORKERS = 4  
PREFETCH_FACTOR = 2


#===============================================================================================================================================


# create dataset
class QADataset(Dataset):
    def __init__(self, questions, answers, tokenizer_Q, tokenizer_A):
        self.questions = questions
        self.answers = answers
        self.tokenizer_Q = tokenizer_Q
        self.tokenizer_A = tokenizer_A

    def __len__(self):
        return len(self.questions)

    def __getitem__(self, idx):
        question = self.questions[idx]
        answer = self.answers[idx]
        encoded_question = self.tokenizer_Q.encode(question)
        encoded_answer = self.tokenizer_A.encode(answer)
        return {
            'question': torch.tensor(encoded_question.ids, dtype=torch.long),
            'answer': torch.tensor(encoded_answer.ids, dtype=torch.long)
        }
    
def collate_fn(batch):
    questions = [item['question'] for item in batch]
    answers = [item['answer'] for item in batch]
    questions = torch.nn.utils.rnn.pad_sequence(questions, batch_first=True, padding_value=1)
    answers = torch.nn.utils.rnn.pad_sequence(answers, batch_first=True, padding_value=1)
    return {'questions': questions, 'answers': answers}




#===============================================================================================================================================




def prepare_data():
    # organize and clean dataset
    questions = pd.read_csv("C:\\Users\\samwh\\OneDrive\\Desktop\\SamGPT\\SamGPT\\data\\raw\\cornell_cleaned\\input3.csv")
    answers = pd.read_csv("C:\\Users\\samwh\\OneDrive\\Desktop\\SamGPT\\SamGPT\\data\\raw\\cornell_cleaned\\target3.csv")
    df = pd.concat([questions.iloc[:,1], answers.iloc[:,1]], axis=1)
    df.columns = ['questions', 'answers']

    questions_list = df["questions"].tolist()
    answers_list = df["answers"].tolist()

    for i in range(len(questions_list) - 1, -1, -1):
        if not isinstance(questions_list[i], str) or not isinstance(answers_list[i], str):
            del questions_list[i]
            del answers_list[i]

    # Split up for training, testing, and validation
    # 80% train - 10% test - 10% validate
    partition_size = len(questions_list) // 10

    val_q = questions_list[-partition_size:]
    test_q = questions_list[-2*partition_size:-partition_size]
    train_q = questions_list[:-2*partition_size]

    val_a = answers_list[-partition_size:]
    test_a = answers_list[-2*partition_size:-partition_size]
    train_a = answers_list[:-2*partition_size]

    return train_q, train_a, test_q, test_a, val_q, val_a, questions_list, answers_list



def tokenize(questions, answers):
    # create question and answer tokenziers
    tokenizer_Q = ByteLevelBPETokenizer()
    tokenizer_Q.train_from_iterator(questions, vocab_size=VOCAB_SIZE, min_frequency=MIN_FREQ, show_progress=True, special_tokens=[
        "<s>", "<pad>", "</s>", "<unk>", "<mask>"
    ])
    tokenizer_Q.save("questions_tokenizer.json")

    tokenizer_A = ByteLevelBPETokenizer()
    tokenizer_A.train_from_iterator(answers, vocab_size=VOCAB_SIZE, min_frequency=MIN_FREQ, show_progress=True, special_tokens=[
        "<s>", "<pad>", "</s>", "<unk>", "<mask>"
    ])
    tokenizer_A.save("answers_tokenizer.json")

    return tokenizer_Q, tokenizer_A


def create_dataloader(train_q, train_a, test_q, test_a, val_q, val_a, tokenizer_Q, tokenizer_A):
    # instantiate dataset
    train_dataset = QADataset(train_q, train_a, tokenizer_Q, tokenizer_A)
    test_dataset = QADataset(test_q, test_a, tokenizer_Q, tokenizer_A)
    validate_dataset = QADataset(val_q, val_a, tokenizer_Q, tokenizer_A)

    # instantiate dataloader
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn, num_workers=NUM_WORKERS, prefetch_factor=PREFETCH_FACTOR)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=True, collate_fn=collate_fn, num_workers=NUM_WORKERS, prefetch_factor=PREFETCH_FACTOR)
    val_loader = DataLoader(validate_dataset, batch_size=BATCH_SIZE, shuffle=False, collate_fn=collate_fn, num_workers=NUM_WORKERS, prefetch_factor=PREFETCH_FACTOR)

    return train_loader, test_loader, val_loader



def positional_encoding(position, d_model):
    # position : padded sentence length 
    # dimension of token embeddings / embedding vector length
    position_array = np.arange(position)[:, np.newaxis]  # Iterating vertical vector with shape: (position, 1)
    dimension_array = np.arange(d_model)[np.newaxis, :]  # Iterating horizontal vector with shape: (1, d_model)

    angle_rads = calculate_angle(position_array, dimension_array, d_model)
    angle_rads[:, 0::2] = np.sin(angle_rads[:, 0::2]) # sin() applied to all even positions 
    angle_rads[:, 1::2] = np.cos(angle_rads[:, 1::2]) # cos() applied to all odd positions

    pe = angle_rads[np.newaxis, :]
    pe_tensor = torch.tensor(pe)
    return pe_tensor

'''
PE : positional encoding
pos : position/index within token/word array
i : postion/index within embedded vector
d_model : dimension of token embeddings
----------------------------------------------
PE_(pos, 2i) = sin(pos/(10000^(2i/d_model)))
PE_(pos, 2i+1) = cos(pos/(10000^(2i/d_model)))
'''
def calculate_angle(pos, i, d_model):
    return pos / np.power(10000, 2 * (i / d_model))


def padding_mask(seq):
    # seq will be a (batch, sequence_length) matrix
    # masks all positions that are padded so model will not train off of padding
    seq = (seq==1).float()
    return seq[:, None, None, :] # Add dimensions for attention heads and words


def look_ahead_mask(length):
    # length : length of the encoded string so that self attention only applies to known values
    return 1 - torch.tril(torch.ones((length, length)))















#===============================================================================================================================================



if __name__ == "__main__":
    train_q, train_a, test_q, test_a, val_q, val_a, questions, answers = prepare_data()
    tokenizer_Q, tokenizer_A = tokenize(questions, answers)
    train_loader, test_loader, val_loader = create_dataloader(train_q, train_a, test_q, test_a, val_q, val_a, tokenizer_Q, tokenizer_A)




    '''
    for batch in test_loader:
        print(batch['questions'].shape, batch['answers'].shape)
        break
    '''
# segment dataset (divisible by batch size)


# store segments until used

# define hyperparameters

# instantiate transformer

# loop through segments 
    # separate segment into batches
    # train model for each batch
        # for each input in batch
            # for each token in input, calculate token embedding + calculate position embedding = input representation
            # pass through transformer block
                # self attention and multi head mechanism
                # feed forware NN
                # normalize
            # linear and softmax
