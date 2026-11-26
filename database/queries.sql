-- ============================================================================
-- File: queries.sql
-- Project: Personal Expense Tracker and Budget Dashboard
-- Description: Analytical Oracle SQL queries for KPI reporting, category
--              breakdowns, monthly spending trends, and budget variance.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Total Income
-- Calculates cumulative income across all recorded 'Income' transactions.
-- ----------------------------------------------------------------------------
SELECT
    COUNT(*) AS INCOME_TRANSACTIONS,
    NVL(SUM(AMOUNT), 0) AS TOTAL_INCOME
FROM EXPENSES
WHERE TRANSACTION_TYPE = 'Income';

-- ----------------------------------------------------------------------------
-- 2. Total Expenses
-- Calculates cumulative spending across all recorded 'Expense' transactions.
-- ----------------------------------------------------------------------------
SELECT
    COUNT(*) AS EXPENSE_TRANSACTIONS,
    NVL(SUM(AMOUNT), 0) AS TOTAL_EXPENSES
FROM EXPENSES
WHERE TRANSACTION_TYPE = 'Expense';

-- ----------------------------------------------------------------------------
-- 3. Total Savings (and Savings Rate %)
-- Computes net savings (Total Income - Total Expenses) and savings percentage.
-- ----------------------------------------------------------------------------
SELECT
    NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE 0 END), 0) AS TOTAL_INCOME,
    NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Expense' THEN AMOUNT ELSE 0 END), 0) AS TOTAL_EXPENSES,
    NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE -AMOUNT END), 0) AS TOTAL_SAVINGS,
    ROUND(
        CASE
            WHEN NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE 0 END), 0) = 0 THEN 0
            ELSE (
                NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE -AMOUNT END), 0)
                / SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE 0 END)
            ) * 100
        END,
        2
    ) AS SAVINGS_RATE_PCT
FROM EXPENSES;

-- ----------------------------------------------------------------------------
-- 4. Category-Wise Expenses
-- Aggregates transaction count, total spend, average spend, and % share
-- for each expense category using Oracle window functions.
-- ----------------------------------------------------------------------------
SELECT
    CATEGORY,
    COUNT(*) AS TRANSACTION_COUNT,
    SUM(AMOUNT) AS TOTAL_EXPENSE,
    ROUND(AVG(AMOUNT), 2) AS AVG_EXPENSE,
    ROUND((SUM(AMOUNT) / SUM(SUM(AMOUNT)) OVER ()) * 100, 2) AS SHARE_PCT
FROM EXPENSES
WHERE TRANSACTION_TYPE = 'Expense'
GROUP BY CATEGORY
ORDER BY TOTAL_EXPENSE DESC;

-- ----------------------------------------------------------------------------
-- 5. Monthly Expenses, Income, Savings, and Budget Status
-- Joins monthly aggregated transactions with BUDGET to track monthly spending
-- against budget limits and flag months where spending exceeded budget.
-- ----------------------------------------------------------------------------
SELECT
    b.BUDGET_MONTH,
    NVL(SUM(CASE WHEN e.TRANSACTION_TYPE = 'Income' THEN e.AMOUNT ELSE 0 END), 0) AS MONTHLY_INCOME,
    NVL(SUM(CASE WHEN e.TRANSACTION_TYPE = 'Expense' THEN e.AMOUNT ELSE 0 END), 0) AS MONTHLY_EXPENSES,
    NVL(SUM(CASE WHEN e.TRANSACTION_TYPE = 'Income' THEN e.AMOUNT ELSE -e.AMOUNT END), 0) AS MONTHLY_SAVINGS,
    b.BUDGET_LIMIT,
    (b.BUDGET_LIMIT - NVL(SUM(CASE WHEN e.TRANSACTION_TYPE = 'Expense' THEN e.AMOUNT ELSE 0 END), 0)) AS BUDGET_VARIANCE,
    CASE
        WHEN NVL(SUM(CASE WHEN e.TRANSACTION_TYPE = 'Expense' THEN e.AMOUNT ELSE 0 END), 0) > b.BUDGET_LIMIT
            THEN 'EXCEEDED'
        ELSE 'WITHIN BUDGET'
    END AS BUDGET_STATUS
FROM BUDGET b
LEFT JOIN EXPENSES e
    ON b.BUDGET_MONTH = e.BUDGET_MONTH
GROUP BY b.BUDGET_MONTH, b.BUDGET_LIMIT
ORDER BY b.BUDGET_MONTH;
