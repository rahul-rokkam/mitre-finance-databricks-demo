-- ============================================================
-- Unity Catalog Bootstrap: Catalog and Schemas
-- ============================================================
-- This script creates the Unity Catalog structure for the
-- Financial Command Center data platform.
--
-- Run this script with appropriate permissions (catalog admin)
-- ============================================================

-- Create the catalog
CREATE CATALOG IF NOT EXISTS `financial-command-center`
COMMENT 'Financial Command Center data platform - Delta tables backing all dashboard visualizations';

-- Use the catalog
USE CATALOG `financial-command-center`;

-- ============================================================
-- Schema: financial-health
-- ============================================================
CREATE SCHEMA IF NOT EXISTS `financial-health`
COMMENT 'Financial Health Snapshot - Core financial KPIs, revenue/budget, margins, cash position';

-- ============================================================
-- Schema: program-portfolio
-- ============================================================
CREATE SCHEMA IF NOT EXISTS `program-portfolio`
COMMENT 'Program Portfolio & Sponsor Funding Analytics - Sponsor-FFRDC allocations, economics, sponsor health';

-- ============================================================
-- Schema: sponsor-funding
-- ============================================================
CREATE SCHEMA IF NOT EXISTS `sponsor-funding`
COMMENT 'Sponsor Funding & Cost Stewardship - Stewardship metrics, efficiency, sponsor experience';

-- ============================================================
-- Schema: risk-compliance
-- ============================================================
CREATE SCHEMA IF NOT EXISTS `risk-compliance`
COMMENT 'Risk & Compliance Monitoring - Audit findings, concentration risk, talent risk, control exceptions';

-- ============================================================
-- Schema: government-relations
-- ============================================================
CREATE SCHEMA IF NOT EXISTS `government-relations`
COMMENT 'Government Relations & Strategic Positioning - Market share, win/loss, capability gaps, strategic pipeline';

-- ============================================================
-- Verify creation
-- ============================================================
SHOW SCHEMAS IN `financial-command-center`;

