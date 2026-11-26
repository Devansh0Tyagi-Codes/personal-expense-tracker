# Power BI Dashboard Build Guide

This folder contains the cleaned CSV datasets, DAX measures, and custom theme file needed to assemble the **Personal Expense Tracker and Budget Dashboard** in **Microsoft Power BI Desktop**.

> **Note:** Power BI Desktop is not installed in the build environment, so no `.pbix` binary is included here. Follow the exact steps below inside Power BI Desktop (Windows) to generate `Personal_Expense_Tracker.pbix` without any manual data cleanup.

---

## 1. Datasets Included in `powerbi/`

| File | Role in Model | Description |
| :--- | :--- | :--- |
| `cleaned_transactions.csv` | Fact Table | 60 cleaned transactions (`2026-06` to `2026-11`) with normalized categories and `year_month`. |
| `budget_targets.csv` | Dimension / Target Table | Monthly budget limits (`budget_month`, `month_name`, `budget_limit`). |
| `monthly_summary.csv` | Pre-aggregated Reference | Monthly income, expenses, savings, savings rate, and budget status. |
| `category_summary.csv` | Pre-aggregated Reference | Expense totals, transaction counts, averages, and percentage shares by category. |
| `monthly_category_breakdown.csv` | Matrix Reference | Month-by-category spending breakdown for cross-validation. |

---

## 2. Step-by-Step Data Import Instructions

1. Open **Microsoft Power BI Desktop** and create a new blank report.
2. Click **Home -> Get Data -> Text/CSV**.
3. Import **`cleaned_transactions.csv`**, click **Transform Data** to open Power Query Editor, and verify column types:
   - `transaction_id`: Text
   - `date`: Date
   - `year_month`: Text
   - `month_name`: Text
   - `type`: Text
   - `category`: Text
   - `description`: Text
   - `amount`: Fixed Decimal Number (or Decimal Number)
4. Click **Home -> New Source -> Text/CSV** inside Power Query and import **`budget_targets.csv`**:
   - `budget_id`: Whole Number
   - `budget_month`: Text
   - `month_name`: Text
   - `budget_limit`: Fixed Decimal Number
5. (Optional) Also import `monthly_summary.csv` and `category_summary.csv` for reference tables.
6. Click **Close & Apply**.
7. In **Data View**, select `cleaned_transactions[month_name]` -> **Column tools -> Sort by column -> `year_month`** (and do the same for `budget_targets[month_name]` sorted by `budget_month`) so months appear chronologically (`Jun 2026` through `Nov 2026`).

---

## 3. Required Data Model Relationships

Open **Model View** and create the following relationship:

- **From Table:** `budget_targets` (`budget_month`)
- **To Table:** `cleaned_transactions` (`year_month`)
- **Cardinality:** One-to-Many (`1 : *`)
- **Cross-filter direction:** Single (`budget_targets` filters `cleaned_transactions`)
- **Make this relationship active:** Checked

*(If you also imported `monthly_summary.csv`, link `budget_targets[budget_month]` `1 : 1` to `monthly_summary[year_month]`.)*

---

## 4. Create DAX Measures

In **Report View** or **Data View**, right-click `cleaned_transactions` -> **New measure** and add each measure from [`dax_measures.dax`](./dax_measures.dax):

- `Total Income` (`₹321,200.00` expected across all months)
- `Total Expenses` (`₹204,500.00` expected across all months)
- `Total Savings` (`₹116,700.00` expected across all months)
- `Savings Rate %` (`36.33%` expected; format as Percentage with 2 decimals)
- `Monthly Budget Limit` (`₹35,000.00` per month / `₹210,000.00` cumulative)
- `Budget Variance`
- `Budget Utilization %`
- `Budget Status`

Format all currency measures as **₹ Indian Rupee (or Currency, 2 decimal places)**.

---

## 5. Apply Visual Theme

1. Go to **View -> Themes (dropdown) -> Browse for themes**.
2. Select **`powerbi/theme.json`**.
3. This applies the project's clean white card background (`#FFFFFF`), subtle page canvas (`#F8FAFC`), dark navy typography (`#0F172A`), and green primary accents (`#16A34A`).

---

## 6. Build the Dashboard Visuals & Layout

Arrange the 16:9 canvas cleanly into three horizontal bands:

### Band 1: Header & Slicers (Top 12% of canvas)
- **Title Text Box:** `Personal Expense Tracker & Budget Dashboard` (Bold, 20pt, `#0F172A`).
- **Slicer 1 (Dropdown):** `budget_targets[month_name]` (Month filter).
- **Slicer 2 (Horizontal Tile):** `cleaned_transactions[category]` (Category filter).

### Band 2: Four KPI Cards (Next 18% of canvas, 4 equal columns)
1. **Card 1 — Total Income:** Field = `[Total Income]` (Accent color: `#16A34A`)
2. **Card 2 — Total Expenses:** Field = `[Total Expenses]` (Accent color: `#0F172A`)
3. **Card 3 — Total Savings:** Field = `[Total Savings]`, Callout + Subtitle/Detail = `[Savings Rate %]`
4. **Card 4 — Budget Status:** Field = `[Monthly Budget Limit]` or `[Budget Status]`

### Band 3: Analytical Charts (Bottom 70% of canvas)
1. **Monthly Spending Line Chart** *(Top-Left / Left half)*:
   - Visual: **Line chart**
   - X-axis: `budget_targets[month_name]`
   - Y-axis: `[Total Expenses]` (Solid Green `#16A34A` or Navy `#0F172A`) and `[Monthly Budget Limit]` (Dashed Red `#DC2626` target line)
   - Turn **Data labels** On.
2. **Category-Wise Expense Pie Chart** *(Top-Right)*:
   - Visual: **Pie chart** (or **Donut chart**)
   - Legend: `cleaned_transactions[category]`
   - Values: `[Total Expenses]`
   - Detail labels: Category + Percent of total (`Housing & Rent` should be `35.21%`).
3. **Income vs. Expense Bar Chart** *(Bottom-Left / Full-width or paired)*:
   - Visual: **Clustered column chart**
   - X-axis: `budget_targets[month_name]`
   - Y-axis: `[Total Income]` (`#16A34A` Green) and `[Total Expenses]` (`#0F172A` Dark Navy)
4. **Monthly Audit Table** *(Bottom-Right)*:
   - Visual: **Table**
   - Columns: `budget_targets[month_name]`, `[Total Income]`, `[Total Expenses]`, `[Total Savings]`, `[Budget Status]`
   - Apply **Conditional Formatting -> Background Color** on `[Budget Status]` (`Exceeded` = soft red `#FEE2E2`, `Within Budget` = soft green `#DCFCE7`).

---

## 7. Save the Report

1. Click **File -> Save As**.
2. Save as `powerbi/Personal_Expense_Tracker.pbix`.
3. Cross-check the KPI cards with the reference totals:
   - **Total Income:** `321,200.00`
   - **Total Expenses:** `204,500.00`
   - **Total Savings:** `116,700.00` (`36.33%`)
   - **Months Exceeding ₹35,000 Budget:** `Aug 2026`, `Oct 2026`, `Nov 2026`
