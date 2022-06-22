-- generate data
-- delete all data from tables we want to use our own data for
TRUNCATE anon.email;
TRUNCATE anon.company;

-- generate data for email table
COPY anon.email
FROM
PROGRAM 'python3 /usr/local/lib/generate_db_data.py --table skylight_admin_email --lines 10';

-- generate data for company table
COPY anon.company
FROM
PROGRAM 'python3 /usr/local/lib/generate_db_data.py --table skylight_valid_organization_external_id --lines 10';

SELECT setval('anon.email_oid_seq', max(oid))
FROM anon.email;

SELECT setval('anon.company_oid_seq', max(oid))
FROM anon.company;

CLUSTER anon.email;
CLUSTER anon.company;