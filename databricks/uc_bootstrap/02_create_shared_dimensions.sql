-- ============================================================
-- Shared Dimension Tables
-- ============================================================
-- These dimension tables are shared across multiple schemas.
-- They are created in the financial-health schema as the 
-- primary location and can be referenced from other schemas.
-- ============================================================

USE CATALOG `financial-command-center`;
USE SCHEMA `financial-health`;

-- ============================================================
-- dim_date_month - Calendar dimension at month grain
-- ============================================================
CREATE TABLE IF NOT EXISTS dim_date_month (
    month DATE NOT NULL COMMENT 'First day of month (primary key)',
    year INT NOT NULL COMMENT 'Calendar year',
    quarter INT NOT NULL COMMENT 'Calendar quarter (1-4)',
    month_num INT NOT NULL COMMENT 'Month number (1-12)',
    month_name STRING NOT NULL COMMENT 'Month name (January, etc.)',
    fiscal_year STRING NOT NULL COMMENT 'Fiscal year (e.g., FY25)',
    fiscal_quarter INT NOT NULL COMMENT 'Fiscal quarter (1-4)'
)
USING DELTA
COMMENT 'Calendar dimension table at month grain'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- ============================================================
-- dim_ffrdc - FFRDC reference data
-- ============================================================
CREATE TABLE IF NOT EXISTS dim_ffrdc (
    ffrdc_id STRING NOT NULL COMMENT 'FFRDC identifier (primary key)',
    ffrdc_name STRING NOT NULL COMMENT 'Full FFRDC name',
    short_name STRING NOT NULL COMMENT 'FFRDC abbreviation'
)
USING DELTA
COMMENT 'FFRDC (Federally Funded Research and Development Center) dimension'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- ============================================================
-- dim_sponsor - Sponsor/Agency reference data
-- ============================================================
CREATE TABLE IF NOT EXISTS dim_sponsor (
    sponsor_id STRING NOT NULL COMMENT 'Sponsor identifier (primary key)',
    sponsor_name STRING NOT NULL COMMENT 'Full sponsor name',
    abbreviation STRING NOT NULL COMMENT 'Sponsor abbreviation (e.g., DoD)',
    agency_group STRING COMMENT 'Agency grouping (Defense, Homeland Security, etc.)'
)
USING DELTA
COMMENT 'Sponsor/Agency dimension table'
TBLPROPERTIES (
    'delta.enableChangeDataFeed' = 'true',
    'quality' = 'gold'
);

-- ============================================================
-- Add primary key constraints (informational)
-- ============================================================
ALTER TABLE dim_date_month ADD CONSTRAINT pk_dim_date_month PRIMARY KEY (month);
ALTER TABLE dim_ffrdc ADD CONSTRAINT pk_dim_ffrdc PRIMARY KEY (ffrdc_id);
ALTER TABLE dim_sponsor ADD CONSTRAINT pk_dim_sponsor PRIMARY KEY (sponsor_id);

