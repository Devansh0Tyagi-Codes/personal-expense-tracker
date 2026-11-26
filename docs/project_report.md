# Project Report: Personal Expense Tracker and Budget Dashboard

**Project Title:** Personal Expense Tracker and Budget Dashboard  
**Domain:** Data Analytics, Web Application Development & Relational Database Management  
**Author:** Devansh Tyagi  
**Repository:** `https://github.com/Devansh0Tyagi-Codes/personal-expense-tracker`  

---

## Abstract

Personal financial discipline depends on timely visibility into cash inflows, recurring obligations, discretionary spending, and budget adherence. This project designs and implements an end-to-end **Personal Expense Tracker and Budget Dashboard** tailored as a comprehensive Data Analyst solution. The system integrates four cohesive layers: (1) an interactive, responsive web dashboard built with HTML5, CSS3, JavaScript, and HTML5 Canvas for real-time transaction capture and `localStorage` persistence; (2) a Python and Pandas ETL pipeline (`data_cleaning.py` and `expense_analysis.py`) that ingests raw transaction logs, resolves missing values, removes duplicates, normalizes categories, and exports structured analytical tables; (3) an Oracle Database schema (`BUDGET` and `EXPENSES`), analytical SQL queries, and a PL/SQL stored procedure (`check_monthly_budget`) for automated budget auditing; and (4) Power BI datasets, DAX measures, custom theme configuration, and dashboard layout specifications. Across a 6-month evaluation dataset (June 2026 – November 2026, 60 cleaned transactions), the system demonstrates complete cross-layer numerical consistency: ₹321,200.00 total income, ₹204,500.00 total expenses, ₹116,700.00 net savings (36.33% savings rate), and accurate detection of budget overruns in August, October, and November 2026.

---

## 1. Introduction

With the rapid growth of digital payments, individuals generate dozens of financial transactions every month across rent, groceries, utilities, transit, education, healthcare, and entertainment. Without structured tracking and analytical summarization, small recurring expenses accumulate unnoticed, eroding monthly savings goals.

The **Personal Expense Tracker and Budget Dashboard** bridges everyday personal finance tracking with enterprise-style data analytics practices. Rather than treating web development, Python analytics, SQL databases, and Business Intelligence as isolated exercises, this project unifies them around a single canonical financial data model.

---

## 2. Problem Statement

Conventional expense tracking methods suffer from three core limitations:
1. **Unstructured Raw Data:** Manual spreadsheets frequently contain duplicate rows, inconsistent category spellings (e.g., `"food & dining"` vs. `"Food & Dining"`), missing category labels, and corrupted numeric entries.
2. **Reactive Budgeting:** Users typically discover overspending only after the month ends because real-time budget threshold alerts are absent.
3. **Disconnected Tooling:** Front-end entry tools rarely export clean schemas aligned with relational databases (Oracle) and BI tools (Power BI).

---

## 3. Objectives

- Develop a clean, responsive financial web dashboard supporting transaction creation, deletion, filtering, CSV export, editable monthly budgets, visual charts, and `localStorage` persistence.
- Build an automated Python & Pandas cleaning and analysis pipeline capable of handling missing values, deduplication, and keyword-based category inference.
- Implement an Oracle SQL relational database schema with referential integrity, analytical SQL reporting queries, and a PL/SQL budget monitoring procedure.
- Prepare Power BI-ready CSV tables, DAX measures, theme styling, and visual layout guidelines.
- Validate end-to-end correctness and numerical consistency across all layers.

---

## 4. System Architecture & Data Flow

The architecture follows a four-stage analytics lifecycle:

1. **Data Capture Layer (Frontend Dashboard):**
   - Built with semantic HTML5 (`index.html`), clean white/navy/green CSS (`css/styles.css`), modular JavaScript (`js/app.js`, `js/charts.js`, `js/sample-data.js`).
   - Stores transactions and monthly budget limits in browser `localStorage` and exports standard CSV files (`expense_transactions.csv`).
2. **ETL & Analytical Processing Layer (Python & Pandas):**
   - `data_cleaning.py` reads `data/raw_transactions.csv`, validates dates and positive amounts, imputes missing categories, standardizes category names, and removes duplicate entries.
   - `expense_analysis.py` computes monthly summaries, category aggregations, savings metrics, and writes five clean CSV outputs to `powerbi/`.
3. **Database & Business Logic Layer (Oracle SQL & PL/SQL):**
   - `database/schema.sql` establishes normalized `BUDGET` and `EXPENSES` tables.
   - `database/sample_data.sql` loads the 6-month canonical dataset.
   - `database/queries.sql` answers core financial KPI questions.
   - `database/budget_check.sql` enforces programmatic budget audits via PL/SQL.
4. **Visualization & Reporting Layer (Power BI):**
   - Uses `powerbi/cleaned_transactions.csv` and `powerbi/budget_targets.csv` linked in a star-like `1:*` relationship, augmented by DAX measures (`powerbi/dax_measures.dax`) and custom theme (`powerbi/theme.json`).

---

## 5. Frontend Design & Implementation

The web dashboard adheres to a clean financial UI palette: crisp white cards (`#FFFFFF`) on a soft slate canvas (`#F8FAFC`), dark navy typography (`#0F172A`), and green financial accents (`#16A34A`).

Key implemented modules:
- **KPI Strip:** Displays Total Income, Total Expenses, Total Savings (with Savings Rate % badge), and an interactive Monthly Budget card with inline limit editing.
- **Budget Alert Banner:** Dynamically evaluates active-month spending against the configured monthly budget, switching between `On Track` (green), `Approaching Limit >= 80%` (amber), and `Budget Exceeded > 100%` (red).
- **Zero-Dependency Canvas Charts (`js/charts.js`):**
  - *Monthly Spending vs. Budget Bar Chart:* Renders monthly expense bars color-coded green (within budget) or red (over budget), overlaid with a dashed budget threshold line and interactive hover tooltips.
  - *Category-Wise Expense Donut Chart:* Displays category proportions, total expense center readout, color-coded legend percentages, and slice hover tooltips.
- **Transaction Management & Filtering:** Supports period selection, type filtering, category filtering, description search, single-click deletion, CSV download, reset to sample data, and clearing all entries.

---

## 6. Python Data Cleaning & Analysis Methodology

### 6.1 Data Cleaning (`data_cleaning.py`)
The raw input (`data/raw_transactions.csv`) intentionally includes real-world data quality issues across `63` rows:
- **Invalid/Missing Numeric Values:** `1` corrupted row (`TX-9999`) with missing amount is detected and dropped via `pd.to_numeric(..., errors="coerce")` validation.
- **Missing Category Imputation:** `1` row (`TX-1009`, `"Pharmacy & Dental Checkup"`) with an empty category is automatically mapped to `"Healthcare"` using keyword matching (`KEYWORD_CATEGORY_RULES`).
- **Text Normalization:** Whitespace and casing inconsistencies (e.g., `"  food & dining  "` / `"expense"`) are standardized to `"Food & Dining"` and `"Expense"`.
- **Duplicate Removal:** `2` duplicate rows (`TX-1004` and `TX-1022`) are identified and eliminated via `drop_duplicates()`, producing `60` clean, unique transactions.

### 6.2 Analytical Aggregations (`expense_analysis.py`)
From the `60` cleaned rows (`DEFAULT_MONTHLY_BUDGET = 35000.0`), Pandas computes:
- **Monthly Summary (`monthly_summary.csv`):** Total income, total expenses, net savings, savings rate %, budget variance, budget status (`Within Budget` / `Exceeded`), and month-over-month expense change.
- **Category Summary (`category_summary.csv`):** Transaction count, total spend, mean transaction size, and % share per category.
- **Monthly Category Breakdown (`monthly_category_breakdown.csv`):** Granular month-by-category pivot source.

---

## 7. Oracle Database & PL/SQL Design

### 7.1 Schema (`database/schema.sql`)
- **`BUDGET`**: Primary key `BUDGET_ID`, unique `BUDGET_MONTH` (`CHAR(7)` validated via `REGEXP_LIKE`), and positive `BUDGET_LIMIT`.
- **`EXPENSES`**: Primary key `TRANSACTION_ID`, foreign key `BUDGET_MONTH` referencing `BUDGET(BUDGET_MONTH)`, `TRANSACTION_TYPE` restricted to `('Income', 'Expense')`, and positive `AMOUNT`.
- Indexes on `(BUDGET_MONTH, TRANSACTION_TYPE)`, `CATEGORY`, and `TX_DATE` optimize analytical queries.

### 7.2 Analytical Queries (`database/queries.sql`)
1. Total Income (`WHERE TRANSACTION_TYPE = 'Income'`)
2. Total Expenses (`WHERE TRANSACTION_TYPE = 'Expense'`)
3. Total Savings & Savings Rate % (conditional `SUM(CASE ...)` aggregation)
4. Category-Wise Expenses with `SUM(SUM(AMOUNT)) OVER ()` analytic window percentage share
5. Monthly Income, Expenses, Savings, and Budget Variance (`LEFT JOIN` between `BUDGET` and `EXPENSES`)

### 7.3 PL/SQL Budget Check (`database/budget_check.sql`)
The stored procedure `check_monthly_budget(p_month IN VARCHAR2)` queries `BUDGET` and `EXPENSES` for a specified month, computes utilization percentage, and prints an audit report via `DBMS_OUTPUT.PUT_LINE`, raising a `WARNING` message whenever expenses exceed `BUDGET_LIMIT` and gracefully handling `NO_DATA_FOUND` exceptions.

---

## 8. Power BI Dashboard Design

Because Power BI Desktop is a Windows GUI application not installed in the automated build environment, no synthetic `.pbix` file was fabricated. Instead, `powerbi/` provides complete production inputs:
- Five cleaned CSV datasets generated directly by `expense_analysis.py`.
- Eleven reusable DAX measures in `powerbi/dax_measures.dax` (`Total Income`, `Total Expenses`, `Total Savings`, `Savings Rate %`, `Monthly Budget Limit`, `Budget Variance`, `Budget Utilization %`, `Budget Status`, etc.).
- Theme file `powerbi/theme.json` matching the web application's visual design.
- Complete step-by-step instructions in `powerbi/powerbi_dashboard_guide.md` covering Power Query type mapping, `1:*` model relationship setup, chronological month sorting, KPI cards, Monthly Spending Line Chart, Category Pie Chart, and Income vs. Expense Bar Chart.

---

## 9. Empirical Results & Insights

Analysis of the canonical 6-month dataset (`2026-06` to `2026-11`, Monthly Budget = ₹35,000.00):

| Month | Income (₹) | Expenses (₹) | Savings (₹) | Savings Rate | Budget Variance (₹) | Status |
| :--- | ---: | ---: | ---: | ---: | ---: | :--- |
| Jun 2026 | 52,500.00 | 31,500.00 | 21,000.00 | 40.00% | +3,500.00 | Within Budget |
| Jul 2026 | 48,200.00 | 33,050.00 | 15,150.00 | 31.43% | +1,950.00 | Within Budget |
| Aug 2026 | 54,500.00 | 36,450.00 | 18,050.00 | 33.12% | -1,450.00 | Exceeded |
| Sep 2026 | 50,500.00 | 29,600.00 | 20,900.00 | 41.39% | +5,400.00 | Within Budget |
| Oct 2026 | 59,000.00 | 36,200.00 | 22,800.00 | 38.64% | -1,200.00 | Exceeded |
| Nov 2026 | 56,500.00 | 37,700.00 | 18,800.00 | 33.27% | -2,700.00 | Exceeded |
| **Total** | **321,200.00** | **204,500.00** | **116,700.00** | **36.33%** | — | **3 Months Over** |

### Category Breakdown Highlights
- **Housing & Rent:** ₹72,000.00 (`35.21%`) — largest fixed cost.
- **Food & Dining:** ₹35,300.00 (`17.26%`) — largest variable cost.
- **Shopping:** ₹28,400.00 (`13.89%`) — primary driver of budget overruns in August, October, and November.
- **Utilities & Bills:** ₹19,550.00 (`9.56%`).
- **Education:** ₹15,000.00 (`7.33%`).
- **Transportation:** ₹14,900.00 (`7.29%`).
- **Entertainment:** ₹12,000.00 (`5.87%`).
- **Healthcare:** ₹7,350.00 (`3.59%`).

---

## 10. Testing & Verification Summary

All implemented components were verified through automated scripts and live browser testing:
1. **Frontend Interactive & `localStorage` Tests:** Verified initial KPI rendering (`₹3,21,200.00` income, `₹2,04,500.00` expenses, `₹1,16,700.00` savings, `₹35,000.00` budget), budget alert banner (`BUDGET EXCEEDED` for `November 2026`), adding a new transaction (`Browser Test Groceries`), `localStorage` persistence across page reload, deleting a transaction, updating the monthly budget (`₹40,000.00`), period filtering (`2026-09`), `Reset Sample Data`, and visual rendering of both Canvas charts with zero console or page errors.
2. **Python Pipeline Tests:** Executed `data_cleaning.py` and `expense_analysis.py` against `data/raw_transactions.csv`; confirmed removal of 2 duplicates and 1 invalid row, 1 category imputation (`Healthcare`), and generation of all 5 Power BI CSVs in `powerbi/`.
3. **Cross-Layer Consistency Check:** Verified programmatically that frontend `js/sample-data.js`, Python `powerbi/cleaned_transactions.csv`, and Oracle `database/sample_data.sql` contain the identical 60 transactions with matching totals.
4. **SQL & PL/SQL Verification:** Validated relational schema, sample `INSERT` statements, and all 5 analytical queries via an in-memory `sqlite3` equivalence test (confirming exact numerical agreement with Python summaries); Oracle-specific PL/SQL procedure `database/budget_check.sql` was verified by static syntax review because an Oracle Database instance is not installed in the build environment.

---

## 11. Conclusion & Future Scope

The **Personal Expense Tracker and Budget Dashboard** delivers a practical, well-architected Data Analyst portfolio project uniting frontend engineering, Pandas ETL, Oracle database design, and Power BI analytics. Future enhancements include connecting the frontend to an Oracle-backed REST API, importing bank/UPI statements automatically, and integrating machine-learning spend forecasting to alert users before a budget overrun occurs.
