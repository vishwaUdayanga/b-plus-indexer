CREATE DATABASE b_plus_indexer_database;

ALTER SYSTEM SET timezone = 'Asia/Colombo';
ALTER SYSTEM SET log_timezone = 'Asia/Colombo';

SELECT pg_reload_conf();
