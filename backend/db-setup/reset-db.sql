DROP SCHEMA IF EXISTS simple_report CASCADE;

CREATE SCHEMA IF NOT EXISTS simple_report;
ALTER ROLE simple_report_app PASSWORD 'api123';
ALTER ROLE simple_report_migrations PASSWORD 'migrations456';
ALTER ROLE simple_report_no_phi PASSWORD 'nophi789';
GRANT ALL PRIVILEGES ON SCHEMA simple_report TO simple_report_migrations WITH GRANT OPTION;
GRANT USAGE ON
 SCHEMA simple_report TO simple_report_app;
ALTER DEFAULT PRIVILEGES FOR USER simple_report_migrations IN SCHEMA simple_report
GRANT SELECT, INSERT, DELETE, UPDATE, TRUNCATE ON TABLES TO simple_report_app;
ALTER DEFAULT PRIVILEGES FOR USER simple_report_migrations IN SCHEMA simple_report
GRANT SELECT, UPDATE ON SEQUENCES TO simple_report_app;
GRANT USAGE ON LANGUAGE plpgsql to simple_report_app;
DROP EXTENSION IF EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA simple_report;

