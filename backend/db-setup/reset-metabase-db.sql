DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA IF NOT EXISTS public;
ALTER SCHEMA public OWNER to simple_report_no_phi;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL PRIVILEGES ON SCHEMA public TO simple_report_migrations;