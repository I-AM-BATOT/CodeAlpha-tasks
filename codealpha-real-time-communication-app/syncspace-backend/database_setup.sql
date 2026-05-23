-- ============================================================
-- SyncSpace Database Setup Script
-- Run this in phpMyAdmin or MySQL CLI before starting the server
-- ============================================================

CREATE DATABASE IF NOT EXISTS syncspace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE syncspace;

-- The server will auto-create all tables on first run via initializeSchema()
-- This script just ensures the database exists.

-- To verify after server start:
-- SHOW TABLES;
-- Expected: users, meetings, participants, messages, shared_files, whiteboard_data, notifications

SELECT 'SyncSpace database ready ✅' AS status;
