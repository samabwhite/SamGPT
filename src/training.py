import data_processing
import pandas as pd
from tokenizers import Tokenizer
from tokenizers.models import BPE
from tokenizers.trainers import BpeTrainer
from tokenizers.pre_tokenizers import Whitespace

# Training Dataset 1 - OpenAssistant
data = data_processing.load_csv("C:\\Users\\samwh\\OneDrive\\Desktop\\SamGPT\\SamGPT\\data\\raw\\openassistant\\oasst1-train.csv")
english_csv = data_processing.filter_data(data, ["text", "role"], 6, lambda x: x == "en")
prompter_csv = data_processing.filter_data(english_csv, ["text"], 1, lambda x: x == "prompter")
assistant_csv = data_processing.filter_data(english_csv, ["text"], 1, lambda x: x == "assistant")

# Convert CSV to Array of Strings
prompter_data = data_processing.csv_to_text_array(prompter_csv, "text")
assistant_data = data_processing.csv_to_text_array(assistant_csv, "text")

# Initialize the tokenizer
tokenizer = Tokenizer(BPE())
# Use Whitespace as pre-tokenizer
tokenizer.pre_tokenizer = Whitespace()
# Initialize the trainer
trainer = BpeTrainer(special_tokens=["<pad>", "<s>", "</s>", "<unk>", "<mask>"])

# Train Tokenizer
tokenizer.train_from_iterator(prompter_data + assistant_data, trainer)

# Save the tokenizer to disk
tokenizer.save("tokenizer.json")