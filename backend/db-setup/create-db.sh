createuser -U "$POSTGRES_USER" -w simple_report_migrations
createuser -U "$POSTGRES_USER" -w simple_report_app
createdb -U "$POSTGRES_USER" -w simple_report --maintenance-db="$POSTGRES_DB"

psql -v ON_ERROR_STOP=1  -U "$POSTGRES_USER" simple_report <<-SQL
    CREATE SCHEMA IF NOT EXISTS simple_report;
    ALTER ROLE simple_report_app PASSWORD 'api123';
    ALTER ROLE simple_report_migrations PASSWORD 'migrations456';
    GRANT ALL PRIVILEGES ON SCHEMA simple_report TO simple_report_migrations;
    GRANT ALL PRIVILEGES ON SCHEMA simple_report TO simple_report_app;
    ALTER DEFAULT PRIVILEGES FOR USER simple_report_migrations IN SCHEMA simple_report
        GRANT SELECT, INSERT, DELETE, UPDATE, TRUNCATE ON TABLES TO simple_report_app;
    ALTER DEFAULT PRIVILEGES FOR USER simple_report_migrations IN SCHEMA simple_report
        GRANT SELECT, UPDATE ON SEQUENCES TO simple_report_app;
    GRANT USAGE ON LANGUAGE plpgsql to simple_report_app;
SQL
