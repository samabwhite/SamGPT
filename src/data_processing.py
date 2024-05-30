# data_processing.py
import pandas as pd

def load_csv(path):
    return pd.read_csv(path)

def filter_data(df, columns, filter_column_index, condition):
    if not all(col in df.columns for col in columns):
        raise ValueError(f"One or more columns: {columns} not found in the DataFrame")
    
    mask = df.iloc[:, filter_column_index].apply(condition)
    return df.loc[mask, columns]

def csv_to_text_array(df, text_column):
    return df[text_column].tolist()
