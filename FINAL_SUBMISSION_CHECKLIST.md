# Final Submission Checklist

**Project:** Personal Expense Tracker and Budget Dashboard  
**GitHub Repository:** `https://github.com/Devansh0Tyagi-Codes/personal-expense-tracker.git`  
**Branch:** `main`  

---

## 1. GitHub Repository & Milestone Commits

- [x] Local workspace (`c:/Users/devan/OneDrive/Desktop/College Projects`) connected to `origin` (`https://github.com/Devansh0Tyagi-Codes/personal-expense-tracker.git`).
- [x] Branch set to `main` and synchronized with `origin/main`.
- [x] `.gitignore` excludes Python caches (`__pycache__/`), virtual environments, IDE files, logs, and secrets.
- [x] All 6 milestone commits created and pushed:
  1. `625e900` — `Initial project setup and documentation`
  2. `7434d57` — `Build responsive expense tracker dashboard`
  3. `a8e8e8c` — `Implement Python expense analysis using Pandas`
  4. `315f6e4` — `Add Oracle SQL schema and PL/SQL procedures`
  5. `7ff9132` — `Add Power BI datasets and dashboard resources`
  6. `e8b3ed2` — `Complete testing and project documentation`
- [x] Final submission documentation & verified desktop screenshots added and pushed.

---

## 2. Deliverable Inventory Check

### Frontend (`index.html`, `css/`, `js/`)
- [x] `index.html` — Responsive dashboard layout with 4 KPI cards, Budget Alert banner, Add Transaction form, charts, and Transaction History table.
- [x] `css/styles.css` — Clean white background, dark navy typography, green accents, responsive breakpoints.
- [x] `js/sample-data.js` — Canonical 60-transaction dataset (`2026-06` to `2026-11`) and `₹35,000.00` monthly budget default.
- [x] `js/charts.js` — HTML5 Canvas **Monthly Spending vs. Budget** bar chart and **Category-Wise Expenses** donut chart with hover tooltips.
- [x] `js/app.js` — `localStorage` persistence, add/delete transactions, budget editing, period/type/category/search filters, CSV export, reset sample data, and clear all.

### Python Data Analysis (`data_cleaning.py`, `expense_analysis.py`, `requirements.txt`, `data/`)
- [x] `requirements.txt` — `pandas>=2.0.0`
- [x] `data/raw_transactions.csv` — `63` raw rows including missing amount, missing category, unnormalized casing/whitespace, and `2` duplicates.
- [x] `data_cleaning.py` — Cleaning, validation, imputation, and deduplication pipeline (`63` raw -> `60` cleaned rows).
- [x] `expense_analysis.py` — Monthly & category aggregations and Power BI CSV export generator.

### Oracle SQL & PL/SQL (`database/`)
- [x] `database/schema.sql` — `BUDGET` and `EXPENSES` tables, PK/FK/CHECK constraints, and indexes.
- [x] `database/sample_data.sql` — `6` `BUDGET` rows and `60` `EXPENSES` rows.
- [x] `database/queries.sql` — Commented queries for Total Income, Total Expenses, Total Savings, Category-Wise Expenses, and Monthly Budget Variance.
- [x] `database/budget_check.sql` — PL/SQL stored procedure `check_monthly_budget(p_month)` with `DBMS_OUTPUT` warning alerts and loop execution block.

### Power BI Resources (`powerbi/`)
- [x] `powerbi/cleaned_transactions.csv` (`60` rows)
- [x] `powerbi/budget_targets.csv` (`6` rows)
- [x] `powerbi/monthly_summary.csv` (`6` rows)
- [x] `powerbi/category_summary.csv` (`8` categories)
- [x] `powerbi/monthly_category_breakdown.csv`
- [x] `powerbi/dax_measures.dax` — `Total Income`, `Total Expenses`, `Total Savings`, `Savings Rate %`, `Monthly Budget Limit`, `Budget Variance`, `Budget Utilization %`, `Budget Status`, etc.
- [x] `powerbi/theme.json` — Clean white, dark navy, and green Power BI theme.
- [x] `powerbi/powerbi_dashboard_guide.md` — Exact import, relationship, DAX, visual layout, and `.pbix` save instructions.

### Documentation & Screenshots (`README.md`, `docs/`)
- [x] `README.md` — Complete project overview, architecture, methodology, setup, results, screenshots, and future scope.
- [x] `docs/project_report.md` — Formal college submission report.
- [x] `docs/screenshots/dashboard_overview.png` — 1440×900 desktop overview capture.
- [x] `docs/screenshots/dashboard_transactions.png` — 1440×900 Transaction History table capture.

---

## 3. Verified QA & Testing Summary (No Pending Tests)

| Test Area | Method | Observed Result |
| :--- | :--- | :--- |
| **Frontend Live Browser QA** | Interactive browser test on `http://127.0.0.1:8765/` | **PASS** — `0` console/page errors; verified initial KPIs (`₹3,21,200.00` income, `₹2,04,500.00` expenses, `₹1,16,700.00` savings, `₹35,000.00` budget), add/delete transaction, `localStorage` reload persistence, `#budgetInput` update (`40000`) after fixing `step="any"`, period filter (`2026-09`), `Reset Sample Data`, and Canvas chart rendering. |
| **Python ETL Execution** | Ran `expense_analysis.py` | **PASS** — `63` raw rows cleaned to `60` rows (`1` invalid dropped, `2` duplicates removed, `1` category imputed); generated all 5 CSVs in `powerbi/`. |
| **Cross-Layer Consistency** | Automated Python comparison | **PASS** — Frontend `js/sample-data.js`, Python `powerbi/cleaned_transactions.csv`, and SQL `database/sample_data.sql` match `60/60` rows identically. |
| **Relational SQL Logic** | In-memory `sqlite3` equivalence run | **PASS** — All 6 `BUDGET` rows, 60 `EXPENSES` rows, and all 5 analytical queries match Python monthly and category outputs exactly. |

---

## 4. What Requires Manual Execution (External Applications Not Installed Locally)

Because **Oracle Database** and **Microsoft Power BI Desktop** are not installed in this build environment, the following steps must be executed manually in those applications before final college demo/submission if a live Oracle session or `.pbix` binary file is required:

### A. Oracle Database (SQL*Plus / SQL Developer / Oracle Live SQL)
*(Automated check covered DDL/DML/query logic via `sqlite3` equivalence and static PL/SQL review; live Oracle execution has not yet been run.)*
1. Connect to your Oracle Database schema (or open [Oracle Live SQL](https://livesql.oracle.com/)).
2. Enable output and run the 4 scripts in exact order:
   ```sql
   SET SERVEROUTPUT ON;
   @database/schema.sql
   @database/sample_data.sql
   @database/queries.sql
   @database/budget_check.sql
   ```
3. Confirm `budget_check.sql` prints `WARNING: Budget limit EXCEEDED` for `2026-08`, `2026-10`, and `2026-11`, and `STATUS OK` / `CAUTION` for `2026-06`, `2026-07`, and `2026-09`.

### B. Microsoft Power BI Desktop (`.pbix` Creation)
*(No fake `.pbix` binary was created; all datasets, DAX, theme, and instructions are ready in `powerbi/`.)*
1. Open **Microsoft Power BI Desktop** on Windows.
2. Follow [`powerbi/powerbi_dashboard_guide.md`](powerbi/powerbi_dashboard_guide.md):
   - Import `powerbi/cleaned_transactions.csv` and `powerbi/budget_targets.csv` via **Get Data -> Text/CSV**.
   - Create the `1 : *` relationship (`budget_targets[budget_month]` -> `cleaned_transactions[year_month]`).
   - Add the DAX measures from `powerbi/dax_measures.dax`.
   - Apply `powerbi/theme.json` (**View -> Themes -> Browse for themes**).
   - Build the 4 KPI cards, Monthly Spending Line Chart, Category-Wise Expense Pie Chart, Income vs. Expense Column Chart, and Monthly Audit Table.
3. Save the report as `powerbi/Personal_Expense_Tracker.pbix`.
