-- ============================================================================
-- File: schema.sql
-- Project: Personal Expense Tracker and Budget Dashboard
-- Description: Oracle Database schema defining BUDGET and EXPENSES tables,
--              primary keys, check constraints, foreign key relationship,
--              and supporting performance indexes.
-- Compatible with: Oracle Database 11g / 12c / 19c / 21c / 23c & Live SQL
-- ============================================================================

-- Drop existing tables safely if re-running setup
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE EXPENSES CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE BUDGET CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN
            RAISE;
        END IF;
END;
/

-- ----------------------------------------------------------------------------
-- Table: BUDGET
-- Stores monthly spending limits (YYYY-MM format) to enforce budget checks.
-- ----------------------------------------------------------------------------
CREATE TABLE BUDGET (
    BUDGET_ID     NUMBER(10)     NOT NULL,
    BUDGET_MONTH  CHAR(7)        NOT NULL,
    BUDGET_LIMIT  NUMBER(12, 2)  NOT NULL,
    CREATED_AT    DATE           DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_BUDGET PRIMARY KEY (BUDGET_ID),
    CONSTRAINT UQ_BUDGET_MONTH UNIQUE (BUDGET_MONTH),
    CONSTRAINT CHK_BUDGET_MONTH_FMT CHECK (REGEXP_LIKE(BUDGET_MONTH, '^[0-9]{4}-(0[1-9]|1[0-2])$')),
    CONSTRAINT CHK_BUDGET_LIMIT_POS CHECK (BUDGET_LIMIT > 0)
);

-- ----------------------------------------------------------------------------
-- Table: EXPENSES
-- Stores all personal financial transactions (Income and Expense entries).
-- Links each transaction month to BUDGET via BUDGET_MONTH.
-- ----------------------------------------------------------------------------
CREATE TABLE EXPENSES (
    TRANSACTION_ID    VARCHAR2(20)   NOT NULL,
    TX_DATE           DATE           NOT NULL,
    BUDGET_MONTH      CHAR(7)        NOT NULL,
    TRANSACTION_TYPE  VARCHAR2(10)   NOT NULL,
    CATEGORY          VARCHAR2(50)   NOT NULL,
    DESCRIPTION       VARCHAR2(200)  NOT NULL,
    AMOUNT            NUMBER(12, 2)  NOT NULL,
    CREATED_AT        DATE           DEFAULT SYSDATE NOT NULL,
    CONSTRAINT PK_EXPENSES PRIMARY KEY (TRANSACTION_ID),
    CONSTRAINT FK_EXPENSES_BUDGET FOREIGN KEY (BUDGET_MONTH) REFERENCES BUDGET (BUDGET_MONTH),
    CONSTRAINT CHK_TX_TYPE CHECK (TRANSACTION_TYPE IN ('Income', 'Expense')),
    CONSTRAINT CHK_AMOUNT_POS CHECK (AMOUNT > 0)
);

-- Indexes to optimize monthly and category-based analytical queries
CREATE INDEX IDX_EXPENSES_MONTH_TYPE ON EXPENSES (BUDGET_MONTH, TRANSACTION_TYPE);
CREATE INDEX IDX_EXPENSES_CATEGORY ON EXPENSES (CATEGORY);
CREATE INDEX IDX_EXPENSES_TX_DATE ON EXPENSES (TX_DATE);
