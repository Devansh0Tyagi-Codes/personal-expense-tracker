"""Data cleaning and normalization pipeline for personal expense transactions."""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Tuple
import pandas as pd


CANONICAL_CATEGORIES: Dict[str, str] = {
    "housing & rent": "Housing & Rent",
    "food & dining": "Food & Dining",
    "transportation": "Transportation",
    "utilities & bills": "Utilities & Bills",
    "shopping": "Shopping",
    "entertainment": "Entertainment",
    "healthcare": "Healthcare",
    "education": "Education",
    "salary": "Salary",
    "freelance": "Freelance",
    "investment": "Investment",
    "other income": "Other Income",
}

KEYWORD_CATEGORY_RULES: Tuple[Tuple[str, str], ...] = (
    ("rent", "Housing & Rent"),
    ("apartment", "Housing & Rent"),
    ("grocer", "Food & Dining"),
    ("meal", "Food & Dining"),
    ("dinner", "Food & Dining"),
    ("lunch", "Food & Dining"),
    ("metro", "Transportation"),
    ("fuel", "Transportation"),
    ("cab", "Transportation"),
    ("train", "Transportation"),
    ("electricity", "Utilities & Bills"),
    ("internet", "Utilities & Bills"),
    ("water", "Utilities & Bills"),
    ("mobile", "Utilities & Bills"),
    ("pharmacy", "Healthcare"),
    ("dental", "Healthcare"),
    ("clinic", "Healthcare"),
    ("medicine", "Healthcare"),
    ("blood", "Healthcare"),
    ("course", "Education"),
    ("book", "Education"),
    ("workshop", "Education"),
    ("semester", "Education"),
    ("cinema", "Entertainment"),
    ("movie", "Entertainment"),
    ("concert", "Entertainment"),
    ("streaming", "Entertainment"),
    ("salary", "Salary"),
    ("freelance", "Freelance"),
    ("consulting", "Freelance"),
    ("dividend", "Investment"),
    ("refund", "Other Income"),
)


def infer_category(description: str, tx_type: str) -> str:
    """Infer a standard category from transaction description keywords."""
    desc_lower = str(description).lower()
    for keyword, category in KEYWORD_CATEGORY_RULES:
        if keyword in desc_lower:
            return category
    return "Other Income" if tx_type == "Income" else "Shopping"


def normalize_category(raw_category: object, description: str, tx_type: str) -> str:
    """Standardize category casing/spacing and fill missing categories."""
    if pd.isna(raw_category) or str(raw_category).strip() == "":
        return infer_category(description, tx_type)
    cleaned = " ".join(str(raw_category).strip().split()).lower()
    if cleaned in CANONICAL_CATEGORIES:
        return CANONICAL_CATEGORIES[cleaned]
    return " ".join(str(raw_category).strip().split()).title()


def clean_transactions(raw_df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """
    Clean raw transaction data:
    - Strip whitespace from text columns
    - Parse and validate date and numeric amount
    - Drop rows missing critical date or positive amount
    - Remove duplicate transactions
    - Normalize transaction type and impute/standardize categories
    """
    stats: Dict[str, int] = {
        "raw_rows": int(len(raw_df)),
        "dropped_missing_or_invalid": 0,
        "duplicates_removed": 0,
        "imputed_categories": 0,
        "cleaned_rows": 0,
    }

    df = raw_df.copy()

    for col in ("transaction_id", "type", "category", "description"):
        if col in df.columns:
            df[col] = df[col].astype("string").str.strip()

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["amount"] = pd.to_numeric(df["amount"], errors="coerce")

    valid_mask = df["date"].notna() & df["amount"].notna() & (df["amount"] > 0)
    stats["dropped_missing_or_invalid"] = int((~valid_mask).sum())
    df = df.loc[valid_mask].copy()

    df["description"] = df["description"].fillna("Miscellaneous Transaction")
    df.loc[df["description"] == "", "description"] = "Miscellaneous Transaction"

    df["type"] = df["type"].fillna("Expense").str.strip().str.title()
    df.loc[~df["type"].isin(["Income", "Expense"]), "type"] = "Expense"

    missing_cat_mask = df["category"].isna() | (df["category"].str.strip() == "")
    stats["imputed_categories"] = int(missing_cat_mask.sum())

    df["category"] = [
        normalize_category(cat, desc, tx_type)
        for cat, desc, tx_type in zip(df["category"], df["description"], df["type"])
    ]

    before_dedup = len(df)
    if "transaction_id" in df.columns and df["transaction_id"].notna().all():
        df = df.drop_duplicates(subset=["transaction_id"], keep="first")
    df = df.drop_duplicates(subset=["date", "type", "category", "description", "amount"], keep="first")
    stats["duplicates_removed"] = int(before_dedup - len(df))

    df["year_month"] = df["date"].dt.strftime("%Y-%m")
    df["month_name"] = df["date"].dt.strftime("%b %Y")
    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    df["amount"] = df["amount"].round(2)

    df = df.sort_values(by=["date", "transaction_id"]).reset_index(drop=True)
    ordered_cols = [
        "transaction_id",
        "date",
        "year_month",
        "month_name",
        "type",
        "category",
        "description",
        "amount",
    ]
    df = df[ordered_cols]
    stats["cleaned_rows"] = int(len(df))
    return df, stats


def load_and_clean_csv(input_path: Path) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Load raw CSV from disk and return cleaned DataFrame with cleaning summary."""
    raw_df = pd.read_csv(input_path)
    return clean_transactions(raw_df)


if __name__ == "__main__":
    default_input = Path(__file__).resolve().parent / "data" / "raw_transactions.csv"
    cleaned, summary = load_and_clean_csv(default_input)
    print("Data Cleaning Summary:", summary)
    print(cleaned.head())
