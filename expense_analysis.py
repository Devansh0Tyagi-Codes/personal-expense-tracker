"""Expense analysis and Power BI CSV export pipeline using Pandas."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Dict
import pandas as pd

from data_cleaning import load_and_clean_csv


DEFAULT_MONTHLY_BUDGET = 35000.0


def build_monthly_summary(df: pd.DataFrame, monthly_budget: float = DEFAULT_MONTHLY_BUDGET) -> pd.DataFrame:
    """Aggregate monthly income, expenses, net savings, and budget variance."""
    income_by_month = (
        df[df["type"] == "Income"]
        .groupby("year_month")["amount"]
        .sum()
        .rename("total_income")
    )
    expense_by_month = (
        df[df["type"] == "Expense"]
        .groupby("year_month")["amount"]
        .sum()
        .rename("total_expenses")
    )

    months = sorted(df["year_month"].unique())
    summary = pd.DataFrame({"year_month": months})
    summary["month_name"] = pd.to_datetime(summary["year_month"] + "-01").dt.strftime("%b %Y")
    summary = summary.merge(income_by_month, on="year_month", how="left")
    summary = summary.merge(expense_by_month, on="year_month", how="left")

    summary["total_income"] = summary["total_income"].fillna(0.0).round(2)
    summary["total_expenses"] = summary["total_expenses"].fillna(0.0).round(2)
    summary["total_savings"] = (summary["total_income"] - summary["total_expenses"]).round(2)
    summary["savings_rate_pct"] = (
        (summary["total_savings"] / summary["total_income"].replace(0, pd.NA)) * 100
    ).fillna(0.0).round(2)
    summary["monthly_budget"] = round(float(monthly_budget), 2)
    summary["budget_variance"] = (summary["monthly_budget"] - summary["total_expenses"]).round(2)
    summary["budget_status"] = summary["total_expenses"].apply(
        lambda exp: "Exceeded" if exp > monthly_budget else "Within Budget"
    )
    summary["mom_expense_change"] = summary["total_expenses"].diff().fillna(0.0).round(2)
    return summary


def build_category_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Compute category-wise expense totals, counts, averages, and percentage shares."""
    expenses = df[df["type"] == "Expense"].copy()
    if expenses.empty:
        return pd.DataFrame(
            columns=["category", "transaction_count", "total_amount", "avg_amount", "share_pct"]
        )

    cat_summary = (
        expenses.groupby("category", as_index=False)
        .agg(
            transaction_count=("transaction_id", "count"),
            total_amount=("amount", "sum"),
            avg_amount=("amount", "mean"),
        )
        .sort_values(by="total_amount", ascending=False)
        .reset_index(drop=True)
    )
    total_exp = cat_summary["total_amount"].sum()
    cat_summary["total_amount"] = cat_summary["total_amount"].round(2)
    cat_summary["avg_amount"] = cat_summary["avg_amount"].round(2)
    cat_summary["share_pct"] = ((cat_summary["total_amount"] / total_exp) * 100).round(2)
    return cat_summary


def build_monthly_category_breakdown(df: pd.DataFrame) -> pd.DataFrame:
    """Produce month-by-category expense breakdown for Power BI matrix visuals."""
    expenses = df[df["type"] == "Expense"]
    breakdown = (
        expenses.groupby(["year_month", "month_name", "category"], as_index=False)
        .agg(
            transaction_count=("transaction_id", "count"),
            total_amount=("amount", "sum"),
        )
        .sort_values(by=["year_month", "total_amount"], ascending=[True, False])
        .reset_index(drop=True)
    )
    breakdown["total_amount"] = breakdown["total_amount"].round(2)
    return breakdown


def build_budget_targets(df: pd.DataFrame, monthly_budget: float = DEFAULT_MONTHLY_BUDGET) -> pd.DataFrame:
    """Create monthly budget targets table aligned with the Oracle BUDGET table."""
    months = sorted(df["year_month"].unique())
    rows = []
    for idx, ym in enumerate(months, start=1):
        rows.append(
            {
                "budget_id": idx,
                "budget_month": ym,
                "month_name": pd.to_datetime(ym + "-01").strftime("%b %Y"),
                "budget_limit": round(float(monthly_budget), 2),
            }
        )
    return pd.DataFrame(rows)


def run_analysis(
    input_csv: Path,
    output_dir: Path,
    monthly_budget: float = DEFAULT_MONTHLY_BUDGET,
) -> Dict[str, object]:
    """Execute full cleaning, KPI calculation, and Power BI CSV export pipeline."""
    cleaned_df, cleaning_stats = load_and_clean_csv(input_csv)
    monthly_df = build_monthly_summary(cleaned_df, monthly_budget=monthly_budget)
    category_df = build_category_summary(cleaned_df)
    monthly_cat_df = build_monthly_category_breakdown(cleaned_df)
    budget_df = build_budget_targets(cleaned_df, monthly_budget=monthly_budget)

    output_dir.mkdir(parents=True, exist_ok=True)
    cleaned_df.to_csv(output_dir / "cleaned_transactions.csv", index=False)
    monthly_df.to_csv(output_dir / "monthly_summary.csv", index=False)
    category_df.to_csv(output_dir / "category_summary.csv", index=False)
    monthly_cat_df.to_csv(output_dir / "monthly_category_breakdown.csv", index=False)
    budget_df.to_csv(output_dir / "budget_targets.csv", index=False)

    total_income = round(float(cleaned_df.loc[cleaned_df["type"] == "Income", "amount"].sum()), 2)
    total_expenses = round(float(cleaned_df.loc[cleaned_df["type"] == "Expense", "amount"].sum()), 2)
    total_savings = round(total_income - total_expenses, 2)
    savings_rate = round((total_savings / total_income) * 100, 2) if total_income > 0 else 0.0

    return {
        "cleaning_stats": cleaning_stats,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "total_savings": total_savings,
        "savings_rate_pct": savings_rate,
        "monthly_budget": monthly_budget,
        "months_over_budget": monthly_df.loc[monthly_df["budget_status"] == "Exceeded", "year_month"].tolist(),
        "top_category": category_df.iloc[0].to_dict() if not category_df.empty else None,
        "monthly_summary": monthly_df,
        "category_summary": category_df,
    }


def main() -> None:
    base_dir = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description="Analyze personal expenses and export Power BI CSVs.")
    parser.add_argument(
        "--input",
        type=Path,
        default=base_dir / "data" / "raw_transactions.csv",
        help="Path to raw transactions CSV file.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=base_dir / "powerbi",
        help="Directory where cleaned Power BI CSV files will be saved.",
    )
    parser.add_argument(
        "--budget",
        type=float,
        default=DEFAULT_MONTHLY_BUDGET,
        help="Monthly expense budget limit.",
    )
    args = parser.parse_args()

    results = run_analysis(args.input, args.output_dir, monthly_budget=args.budget)

    print("=== DATA CLEANING SUMMARY ===")
    for k, v in results["cleaning_stats"].items():
        print(f"  {k}: {v}")

    print("\n=== OVERALL FINANCIAL KPIs ===")
    print(f"  Total Income   : INR {results['total_income']:,.2f}")
    print(f"  Total Expenses : INR {results['total_expenses']:,.2f}")
    print(f"  Total Savings  : INR {results['total_savings']:,.2f} ({results['savings_rate_pct']:.2f}%)")
    print(f"  Monthly Budget : INR {results['monthly_budget']:,.2f}")
    print(f"  Over Budget In : {', '.join(results['months_over_budget']) or 'None'}")

    print("\n=== MONTHLY SUMMARY ===")
    print(results["monthly_summary"].to_string(index=False))

    print("\n=== CATEGORY-WISE EXPENSE ANALYSIS ===")
    print(results["category_summary"].to_string(index=False))

    print(f"\nExported Power BI CSV datasets to: {args.output_dir}")


if __name__ == "__main__":
    main()
