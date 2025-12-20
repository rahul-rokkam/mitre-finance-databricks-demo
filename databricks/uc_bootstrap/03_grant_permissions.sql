-- ============================================================
-- Grant Permissions
-- ============================================================
-- Configure access permissions for the Financial Command Center
-- data platform. Adjust group names as needed for your workspace.
-- ============================================================

USE CATALOG `financial-command-center`;

-- ============================================================
-- Catalog-level permissions
-- ============================================================

-- Grant usage on catalog to data consumers
GRANT USE CATALOG ON CATALOG `financial-command-center` TO `data-consumers`;

-- Grant all privileges to data engineers for pipeline execution
GRANT ALL PRIVILEGES ON CATALOG `financial-command-center` TO `data-engineers`;

-- ============================================================
-- Schema-level permissions
-- ============================================================

-- Financial Health schema
GRANT USE SCHEMA ON SCHEMA `financial-health` TO `data-consumers`;
GRANT SELECT ON SCHEMA `financial-health` TO `data-consumers`;
GRANT ALL PRIVILEGES ON SCHEMA `financial-health` TO `data-engineers`;

-- Program Portfolio schema
GRANT USE SCHEMA ON SCHEMA `program-portfolio` TO `data-consumers`;
GRANT SELECT ON SCHEMA `program-portfolio` TO `data-consumers`;
GRANT ALL PRIVILEGES ON SCHEMA `program-portfolio` TO `data-engineers`;

-- Sponsor Funding schema
GRANT USE SCHEMA ON SCHEMA `sponsor-funding` TO `data-consumers`;
GRANT SELECT ON SCHEMA `sponsor-funding` TO `data-consumers`;
GRANT ALL PRIVILEGES ON SCHEMA `sponsor-funding` TO `data-engineers`;

-- Risk Compliance schema
GRANT USE SCHEMA ON SCHEMA `risk-compliance` TO `data-consumers`;
GRANT SELECT ON SCHEMA `risk-compliance` TO `data-consumers`;
GRANT ALL PRIVILEGES ON SCHEMA `risk-compliance` TO `data-engineers`;

-- Government Relations schema
GRANT USE SCHEMA ON SCHEMA `government-relations` TO `data-consumers`;
GRANT SELECT ON SCHEMA `government-relations` TO `data-consumers`;
GRANT ALL PRIVILEGES ON SCHEMA `government-relations` TO `data-engineers`;

-- ============================================================
-- Service Principal for API access
-- ============================================================
-- Grant read access to the app's service principal
-- GRANT USE CATALOG ON CATALOG `financial-command-center` TO `financial-command-center-sp`;
-- GRANT USE SCHEMA ON SCHEMA `financial-health` TO `financial-command-center-sp`;
-- GRANT SELECT ON SCHEMA `financial-health` TO `financial-command-center-sp`;
-- (Repeat for other schemas as needed)

