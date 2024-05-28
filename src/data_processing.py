import pandas as pd

def load_csv(filepath):
    return pd.read_csv(filepath)

def filter_data(df, columns_to_keep, filter_column_index, condition):
    # Apply the condition to the filter column and get a boolean Series
    mask = df.iloc[:, filter_column_index].apply(condition)
    # Filter the DataFrame rows and select specific columns to keep
    filtered_df = df[mask][columns_to_keep]
    return filtered_df

def save_csv(df, filepath):
    df.to_csv(filepath, index=False)

def csv_to_text_array(df, column_name):
    # Extract the specified column as a list of strings
    text_array = df[column_name].tolist()
    return text_array