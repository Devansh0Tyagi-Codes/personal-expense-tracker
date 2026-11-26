-- ============================================================================
-- File: budget_check.sql
-- Project: Personal Expense Tracker and Budget Dashboard
-- Description: PL/SQL stored procedure to evaluate a given month's total
--              expenses against the configured BUDGET limit and output
--              warnings when the budget threshold is approached or exceeded.
-- ============================================================================

SET SERVEROUTPUT ON;

CREATE OR REPLACE PROCEDURE check_monthly_budget (
    p_month IN VARCHAR2
) IS
    v_budget_limit    BUDGET.BUDGET_LIMIT%TYPE;
    v_total_expenses  NUMBER(12, 2) := 0;
    v_total_income    NUMBER(12, 2) := 0;
    v_difference      NUMBER(12, 2) := 0;
    v_utilization     NUMBER(6, 2)  := 0;
BEGIN
    -- Retrieve the configured budget limit for the requested month (YYYY-MM)
    SELECT BUDGET_LIMIT
    INTO v_budget_limit
    FROM BUDGET
    WHERE BUDGET_MONTH = p_month;

    -- Calculate total expenses and income for that month
    SELECT
        NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Expense' THEN AMOUNT ELSE 0 END), 0),
        NVL(SUM(CASE WHEN TRANSACTION_TYPE = 'Income' THEN AMOUNT ELSE 0 END), 0)
    INTO v_total_expenses, v_total_income
    FROM EXPENSES
    WHERE BUDGET_MONTH = p_month;

    v_utilization := ROUND((v_total_expenses / v_budget_limit) * 100, 2);

    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');
    DBMS_OUTPUT.PUT_LINE('Budget Audit Report for Month : ' || p_month);
    DBMS_OUTPUT.PUT_LINE('Monthly Income                : INR ' || TO_CHAR(v_total_income, 'FM999,999,990.00'));
    DBMS_OUTPUT.PUT_LINE('Monthly Budget Limit          : INR ' || TO_CHAR(v_budget_limit, 'FM999,999,990.00'));
    DBMS_OUTPUT.PUT_LINE('Actual Monthly Expenses       : INR ' || TO_CHAR(v_total_expenses, 'FM999,999,990.00'));
    DBMS_OUTPUT.PUT_LINE('Budget Utilization            : ' || TO_CHAR(v_utilization, 'FM990.00') || '%');

    -- Evaluate spending against the monthly budget limit
    IF v_total_expenses > v_budget_limit THEN
        v_difference := v_total_expenses - v_budget_limit;
        DBMS_OUTPUT.PUT_LINE(
            'WARNING: Budget limit EXCEEDED by INR ' || TO_CHAR(v_difference, 'FM999,999,990.00') || '!'
        );
    ELSIF v_utilization >= 80 THEN
        v_difference := v_budget_limit - v_total_expenses;
        DBMS_OUTPUT.PUT_LINE(
            'CAUTION: Approaching budget limit. Remaining balance: INR ' || TO_CHAR(v_difference, 'FM999,999,990.00')
        );
    ELSE
        v_difference := v_budget_limit - v_total_expenses;
        DBMS_OUTPUT.PUT_LINE(
            'STATUS OK: Spending is within budget. Remaining balance: INR ' || TO_CHAR(v_difference, 'FM999,999,990.00')
        );
    END IF;
    DBMS_OUTPUT.PUT_LINE('------------------------------------------------------------');

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: No budget configuration found for month ' || p_month || '.');
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('ERROR: Unexpected failure during budget check - ' || SQLERRM);
END check_monthly_budget;
/

-- ----------------------------------------------------------------------------
-- Example Execution: Audit all months present in the BUDGET table
-- ----------------------------------------------------------------------------
BEGIN
    FOR rec IN (SELECT BUDGET_MONTH FROM BUDGET ORDER BY BUDGET_MONTH) LOOP
        check_monthly_budget(rec.BUDGET_MONTH);
    END LOOP;
END;
/
