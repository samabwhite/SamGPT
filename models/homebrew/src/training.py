import pandas as pd
import math
import time
import os
from datetime import datetime
import model

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader

from tokenizers import Tokenizer
from tokenizers.pre_tokenizers import Whitespace
from tokenizers.trainers import BpeTrainer
from tokenizers.models import BPE


def build_tokenizer(data):
    tokenizer = Tokenizer(BPE(unk_token="[UNK]"))
    tokenizer.pre_tokenizer = Whitespace()

    BPE_trainer = BpeTrainer(
        show_progress=True,
        special_tokens=["[CLS]", "[SEP]", "[PAD]", "[UNK]", "[USR]", "[SYS]", "[EOS]", "[MASK]"],
        )

    tokenizer.train_from_iterator(
        data, 
        trainer=BPE_trainer
    )
    
    return tokenizer


if __name__ == '__main__':
    training_path = f".\\models\\training_{datetime.now().strftime('%Y%m%d_%H%M')}"
    os.makedirs(training_path)

    data = pd.read_csv("..\\data\\SciQ\\cleaned\\train\\sci.csv")["Data"]
    tokenizer = build_tokenizer(data)
    vocab_size = tokenizer.get_vocab_size()
    tokenizer.save(f"{training_path}\\tokenizer.json")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f'Using device: {device}')

    d_model = 512 
    num_heads = 8
    num_layers = 6
    dropout = 0.2
    batch_size = 32
    learning_rate = 1e-5
    num_epochs = 100
    eos_token_id = 6
    num_workers = 12

    training_data = model.CSV_Dataset("..\\data\\SciQ\\cleaned\\train\\sci.csv", "..\\data\\SciQ\\cleaned\\train\\sci_questions.csv", tokenizer, "Data", "question")
    training_data_loader = DataLoader(dataset=training_data, batch_size=batch_size, shuffle=True, drop_last=True, num_workers=num_workers)

    val_data = model.CSV_Dataset("..\\data\\SciQ\\cleaned\\validate\\sci_val.csv", "..\\data\\SciQ\\cleaned\\validate\\sci_val_questions.csv", tokenizer, "Data", "question", max_len=training_data.max_len)
    val_data_loader = DataLoader(dataset=val_data, batch_size=batch_size, shuffle=True, drop_last=True, num_workers=num_workers)


    total_samples = len(training_data)
    n_iterations = math.ceil(total_samples / batch_size)
    max_len = training_data.max_len

    print(f"d_model: {d_model}")
    print(f"num_heads: {num_heads}")
    print(f"num_layers: {num_layers}")
    print(f"dropout: {dropout}")
    print(f"batch_size: {batch_size}")
    print(f"learning_rate: {learning_rate}")
    print(f"num_epochs: {num_epochs}")
    print(f"vocab_size: {vocab_size}")
    print(f"max_len: {max_len}\n")

    gpt_model = model.GPT(vocab_size, d_model, num_heads, num_layers, max_len, dropout).to(device)
    criterion = nn.CrossEntropyLoss()

    optimizer = optim.Adam(gpt_model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'min')

    best_val_loss = float('inf')
    patience = 2  
    wait = 0

    for epoch in range(num_epochs):
        start_epoch = time.time()
        
        # Training Phase
        gpt_model.train()
        for i, (data, question_length) in enumerate(training_data_loader):
            data = data.to(device)
            question_length = question_length.to(device)

            mask = model.create_mask(batch_size, max_len, question_length).to(device)

            logits = gpt_model(data, mask)
            logits = logits.view(-1, vocab_size)
            target_labels_batch = data.view(-1)

            loss = criterion(logits, target_labels_batch)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
        end_epoch = time.time()
        print(f"Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}, Elapsed Time: {end_epoch - start_epoch} seconds\n")
        
        # Validation Phase
        gpt_model.eval()
        val_loss = 0.0
        with torch.no_grad():
            for data, question_length in val_data_loader:
                data = data.to(device)
                question_length = torch.tensor(question_length).to(device)

                mask = model.create_mask(batch_size, max_len, question_length).to(device)

                logits = gpt_model(data, mask)
                logits = logits.view(-1, vocab_size)
                target_labels_batch = data.view(-1)

                loss = criterion(logits, target_labels_batch)
                val_loss += loss.item()

        avg_val_loss = val_loss / len(val_data_loader)
        scheduler.step(avg_val_loss)

        print(f"Epoch [{epoch+1}/{num_epochs}], Validation Loss: {avg_val_loss:.4f}")

        # Save Model Progress Phase
        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            wait = 0
            gpt_model.save_model(gpt_model, optimizer, training_path, d_model, num_heads, num_layers, dropout, vocab_size, max_len, learning_rate, batch_size)
        else:
            wait += 1
            if wait >= patience:
                print("Early stopping")
                break
    

    gpt_model.save_model(gpt_model, optimizer, training_path, d_model, num_heads, num_layers, dropout, vocab_size, max_len, learning_rate, batch_size)

