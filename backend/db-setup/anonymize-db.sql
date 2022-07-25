-- Extension docs: https://postgresql-anonymizer.readthedocs.io/en/latest/
-- Extension repo: https://gitlab.com/dalibo/postgresql_anonymizer

SELECT pg_catalog.set_config('search_path', 'simple_report', false);

-- create anon extension
CREATE EXTENSION anon CASCADE;

-- init anon extension
SELECT anon.init();

---------------------
-- SR_FAKER SCHEMA --
---------------------

-- create custom schema for our custom masking functions
CREATE SCHEMA sr_faker;

-- trust our custom schema
SECURITY LABEL FOR anon ON SCHEMA sr_faker IS 'TRUSTED';

-- fake_email | text
CREATE OR REPLACE FUNCTION sr_faker.email()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(12), '-', anon.fake_email());
$func$
  LANGUAGE SQL
  VOLATILE
;

-- fake_first_name | text
CREATE OR REPLACE FUNCTION sr_faker.first_name()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(12), '-', anon.fake_first_name());
$func$
  LANGUAGE SQL
  VOLATILE
;

-- fake_middle_name | text
CREATE OR REPLACE FUNCTION sr_faker.middle_name()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(12));
$func$
  LANGUAGE SQL
  VOLATILE
;

-- fake_last_name | text
CREATE OR REPLACE FUNCTION sr_faker.last_name()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(12), '-', anon.fake_last_name());
$func$
  LANGUAGE SQL
  VOLATILE
;

-- facility_name/organization_name | text
CREATE OR REPLACE FUNCTION sr_faker.group_name()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(12), '-', anon.fake_first_name(), '-', 'facility');
$func$
  LANGUAGE SQL
  VOLATILE
;

DROP TYPE IF EXISTS sr_faker.sr_json_vals;
CREATE TYPE sr_faker.sr_json_vals AS (path text[], value jsonb);
CREATE OR REPLACE FUNCTION sr_faker.jsonb_updater(sr_json_data jsonb, variadic sr_json_to_update sr_faker.sr_json_vals[])
    RETURNS JSON
    LANGUAGE plpgsql
AS $func$
DECLARE sr_json_args sr_faker.sr_json_vals;
BEGIN
    FOREACH sr_json_args IN ARRAY sr_json_to_update LOOP
        sr_json_data := jsonb_set(sr_json_data, sr_json_args.path, sr_json_args.value, true);
    END LOOP;
    RETURN to_json(sr_json_data);
END $func$;

-- clia_number | text
CREATE OR REPLACE FUNCTION sr_faker.clia_number()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(9), '-', anon.random_string(1));
$func$
  LANGUAGE SQL
  VOLATILE
;

-- street | text[]
CREATE OR REPLACE FUNCTION sr_faker.street()
RETURNS text AS
$func$
  SELECT ARRAY[CONCAT(anon.random_int_between(1,999999), ' ', anon.fake_last_name())];
$func$
  LANGUAGE SQL
  VOLATILE
;

-- county | text
CREATE OR REPLACE FUNCTION sr_faker.county()
RETURNS text AS
$func$
  SELECT CONCAT(anon.fake_last_name(), ' ', 'County');
$func$
  LANGUAGE SQL
  VOLATILE
;

-- phone_number | text
CREATE OR REPLACE FUNCTION sr_faker.phone_number()
RETURNS text AS
$func$
  SELECT CONCAT('(', anon.random_int_between(100, 200), ')', ' ', anon.random_int_between(100, 999), '-', anon.random_int_between(1000, 9999));
$func$
  LANGUAGE SQL
  VOLATILE
;

-- lookup_id | text
CREATE OR REPLACE FUNCTION sr_faker.lookup_id()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_string(8), '-', anon.random_string(4), '-', anon.random_string(4), '-', anon.random_string(4), '-', anon.random_string(12));
$func$
  LANGUAGE SQL
  VOLATILE
;

-- provider_id | text
CREATE OR REPLACE FUNCTION sr_faker.provider_id()
RETURNS text AS
$func$
  SELECT CONCAT(anon.random_bigint_between(1000000000,9999999999));
$func$
  LANGUAGE SQL
  VOLATILE
;

-- birthday | [year, day, month]
CREATE OR REPLACE FUNCTION sr_faker.test_event_patient_data_birthday()
RETURNS text AS
$func$
  SELECT ARRAY[anon.random_int_between(1901,2020), anon.random_int_between(1, 28), anon.random_int_between(1, 12)];
$func$
  LANGUAGE SQL
  VOLATILE
;

-- result | POSITIVE || NEGATIVE || INCONCLUSIVE
CREATE OR REPLACE FUNCTION sr_faker.test_result()
RETURNS text AS
$func$
    SELECT result FROM unnest(enum_range(NULL::simple_report.test_result)) result ORDER BY random() LIMIT 1;
$func$
  LANGUAGE SQL
  VOLATILE
;

-- login_email | text
-- select users from api_user.login_email, if it is a skylight email (@skylight.digital) return it, otherwise return a fake email function
CREATE OR REPLACE FUNCTION sr_faker.login_email(current_email text)
RETURNS text AS
$func$
  select CASE WHEN current_email LIKE '%@skylight.digital%' 
  THEN 
    current_email 
  ELSE 
    anon.fake_email()
  END;
$func$
  LANGUAGE SQL
  VOLATILE
;

-- login_email | text
-- select users from api_user.login_email, if it is a skylight email (@skylight.digital) return it, otherwise return a fake email function
CREATE OR REPLACE FUNCTION sr_faker.organization_external_id(organization_external_id text)
RETURNS text AS
$func$
  select CASE WHEN organization_external_id LIKE any (array['%DIS_ORG%', '%DAT_ORG%'])
  THEN 
    organization_external_id
  ELSE 
    anon.random_string(14)
  END;
$func$
  LANGUAGE SQL
  VOLATILE
;

--------------------------
-- SIMPLE_REPORT TABLES --
--------------------------
--
DROP TABLE simple_report.databasechangeloglock;
update simple_report.databasechangelog set md5sum = '';
--
----------------------------
-- SIMPLE_REPORT.API_USER --
----------------------------

-- login_email | text
SECURITY LABEL FOR anon ON COLUMN api_user.login_email
IS 'MASKED WITH FUNCTION sr_faker.login_email(login_email)';

-- first_name | text
SECURITY LABEL FOR anon ON COLUMN api_user.first_name
IS 'MASKED WITH FUNCTION sr_faker.first_name()';

-- middle_name | text
SECURITY LABEL FOR anon ON COLUMN api_user.middle_name
IS 'MASKED WITH FUNCTION sr_faker.middle_name()';

-- last_name | text
SECURITY LABEL FOR anon ON COLUMN api_user.last_name
IS 'MASKED WITH FUNCTION sr_faker.last_name()';

-- suffix | text
SECURITY LABEL FOR anon ON COLUMN api_user.suffix
IS 'MASKED WITH VALUE '''' ';

-----------------------------------
-- SIMPLE_REPORT.DATA_HUB_UPLOAD --
-----------------------------------

-- error_message | text
SECURITY LABEL FOR anon ON COLUMN data_hub_upload.error_message
IS 'MASKED WITH VALUE '''' ';

-- response_data | jsonb
SECURITY LABEL FOR anon ON COLUMN data_hub_upload.response_data
IS 'MASKED WITH FUNCTION to_jsonb(anon.random_string(4))';

----------------------------
-- SIMPLE_REPORT.FACILITY --
----------------------------

-- facility_name | text
SECURITY LABEL FOR anon ON COLUMN facility.facility_name
IS 'MASKED WITH FUNCTION sr_faker.group_name()';

-- clia_number | text
SECURITY LABEL FOR anon ON COLUMN facility.clia_number
IS 'MASKED WITH FUNCTION sr_faker.clia_number()';

-- street | text[]
SECURITY LABEL FOR anon ON COLUMN facility.street
IS 'MASKED WITH VALUE sr_faker.street()';

-- city | text
SECURITY LABEL FOR anon ON COLUMN facility.city
IS 'MASKED WITH FUNCTION anon.fake_city()';

-- county | text
SECURITY LABEL FOR anon ON COLUMN facility.county
IS 'MASKED WITH FUNCTION sr_faker.county()';

-- state | text
SECURITY LABEL FOR anon ON COLUMN facility.state
IS 'MASKED WITH VALUE ''DC'' ';

-- postal_code | text
SECURITY LABEL FOR anon ON COLUMN facility.postal_code
IS 'MASKED WITH FUNCTION anon.random_zip()';

-- telephone | text
SECURITY LABEL FOR anon ON COLUMN facility.telephone
IS 'MASKED WITH FUNCTION sr_faker.phone_number()';

-- email | text
SECURITY LABEL FOR anon ON COLUMN facility.email
IS 'MASKED WITH FUNCTION sr_faker.email()';

--------------------------------
-- SIMPLE_REPORT.ORGANIZATION --
--------------------------------

-- organization_name | text
SECURITY LABEL FOR anon ON COLUMN organization.organization_name
IS 'MASKED WITH FUNCTION sr_faker.group_name()';

-- organization_external_id | text
SECURITY LABEL FOR anon ON COLUMN organization.organization_external_id
IS 'MASKED WITH FUNCTION sr_faker.organization_external_id(organization_external_id)';

-- organization_type | text
SECURITY LABEL FOR anon ON COLUMN organization.organization_type
IS 'MASKED WITH VALUE ''other'' ';

--------------------------------------
-- SIMPLE_REPORT.ORGANIZATION_QUEUE --
--------------------------------------

-- organization_name | text
SECURITY LABEL FOR anon ON COLUMN organization_queue.organization_name
IS 'MASKED WITH FUNCTION sr_faker.group_name()';

-- organization_external_id | text
SECURITY LABEL FOR anon ON COLUMN organization_queue.organization_external_id
IS 'MASKED WITH FUNCTION sr_faker.organization_external_id(organization_external_id)';

-- request_data | jsonb
SECURITY LABEL FOR anon ON COLUMN organization_queue.request_data
IS 'MASKED WITH FUNCTION sr_faker.jsonb_updater(request_data,'
  '(''{name}'', to_jsonb(sr_faker.middle_name())),'
  '(''{type}'', ''"other"''),'
  '(''{email}'', to_jsonb(sr_faker.email())),'
  '(''{state}'', ''"DC"''),'
  '(''{lastName}'', to_jsonb(sr_faker.last_name())),'
  '(''{firstName}'', to_jsonb(sr_faker.first_name())),'
  '(''{workPhoneNumber}'', to_jsonb(sr_faker.phone_number()))'
')';

-----------------------------------
-- SIMPLE_REPORT.PATIENT_ANSWERS --
-----------------------------------

--  ask_on_entry | jsonb
SECURITY LABEL FOR anon ON COLUMN patient_answers.ask_on_entry
IS 'MASKED WITH FUNCTION sr_faker.jsonb_updater(ask_on_entry,'
  '(''{symptoms,25064002}'', ''false''),'
  '(''{symptoms,36955009}'', ''false''),'
  '(''{symptoms,43724002}'', ''false''),'
  '(''{symptoms,44169009}'', ''false''),'
  '(''{symptoms,49727002}'', ''false''),'
  '(''{symptoms,62315008}'', ''false''),'
  '(''{symptoms,64531003}'', ''false''),'
  '(''{symptoms,68235000}'', ''false''),'
  '(''{symptoms,68962001}'', ''false''),'
  '(''{symptoms,84229001}'', ''false''),'
  '(''{symptoms,103001002}'', ''false''),'
  '(''{symptoms,162397003}'', ''false''),'
  '(''{symptoms,230145002}'', ''false''),'
  '(''{symptoms,267036007}'', ''false''),'
  '(''{symptoms,422400008}'', ''false''),'
  '(''{symptoms,422587007}'', ''false''),'
  '(''{symptoms,426000000}'', ''false''),'
  '(''{firstTest}'', ''false''),'
  '(''{pregnancy}'', ''"60001007"''),'
  '(''{noSymptoms}'', ''false''),'
  '(''{priorTestDate}'', ''null''),'
  '(''{priorTestType}'', ''null''),'
  '(''{priorTestResult}'', ''null''),'
  '(''{symptomOnsetDate}'', ''[2020, 1, 1]'')'
')';

---------------------------------------------
-- SIMPLE_REPORT.PATIENT_REGISTRATION_LINK --
---------------------------------------------

-- patient_registration_link | text
SECURITY LABEL FOR anon ON COLUMN patient_registration_link.patient_registration_link
IS 'MASKED WITH FUNCTION anon.random_string(15)';

--------------------------
-- SIMPLE_REPORT.PERSON --
--------------------------

-- first_name | text
SECURITY LABEL FOR anon ON COLUMN person.first_name
IS 'MASKED WITH FUNCTION sr_faker.first_name()';

-- middle_name | text
SECURITY LABEL FOR anon ON COLUMN person.middle_name
IS 'MASKED WITH FUNCTION sr_faker.middle_name()';

-- last_name | text
SECURITY LABEL FOR anon ON COLUMN person.last_name
IS 'MASKED WITH FUNCTION sr_faker.middle_name()';

-- suffix | text
SECURITY LABEL FOR anon ON COLUMN person.suffix
IS 'MASKED WITH VALUE '''' ';

-- race | text
SECURITY LABEL FOR anon ON COLUMN person.race
IS 'MASKED WITH VALUE ''other'' ';

-- gender | text
SECURITY LABEL FOR anon ON COLUMN person.gender
IS 'MASKED WITH VALUE ''refused'' ';

-- ethnicity | text
SECURITY LABEL FOR anon ON COLUMN person.ethnicity
IS 'MASKED WITH VALUE ''refused'' ';

-- lookup_id | text
SECURITY LABEL FOR anon ON COLUMN person.lookup_id
IS 'MASKED WITH FUNCTION sr_faker.lookup_id()';

-- birth_date | date
SECURITY LABEL FOR anon ON COLUMN person.birth_date
IS 'MASKED WITH FUNCTION anon.random_date()';

-- street | text[]
SECURITY LABEL FOR anon ON COLUMN person.street
IS 'MASKED WITH VALUE sr_faker.street()';

-- city | text
SECURITY LABEL FOR anon ON COLUMN person.city
IS 'MASKED WITH FUNCTION anon.fake_city()';

-- county | text
SECURITY LABEL FOR anon ON COLUMN person.county
IS 'MASKED WITH FUNCTION sr_faker.county()';

-- state | text
SECURITY LABEL FOR anon ON COLUMN person.state
IS 'MASKED WITH VALUE ''DC'' ';

-- postal_code | text
SECURITY LABEL FOR anon ON COLUMN person.postal_code
IS 'MASKED WITH FUNCTION anon.random_zip()';

-- email | text
SECURITY LABEL FOR anon ON COLUMN person.email
IS 'MASKED WITH FUNCTION sr_faker.email()';

-- employed_in_healthcare | boolean
SECURITY LABEL FOR anon ON COLUMN person.employed_in_healthcare
IS 'MASKED WITH VALUE ''f'' ';

-- role | text
-- SECURITY LABEL FOR anon ON COLUMN person.role
-- IS 'MASKED WITH VALUE ''ADMIN'' ';

-- tribal_affiliation | jsonb
SECURITY LABEL FOR anon ON COLUMN person.tribal_affiliation
IS 'MASKED WITH VALUE ''[null]''';

-- preferred_language | text
SECURITY LABEL FOR anon ON COLUMN person.preferred_language
IS 'MASKED WITH VALUE '''' ';

-- country | text
SECURITY LABEL FOR anon ON COLUMN person.country
IS 'MASKED WITH VALUE ''USA'' ';

-- emails | text[]
SECURITY LABEL FOR anon ON COLUMN person.emails
IS 'MASKED WITH FUNCTION ARRAY[]';

--------------------------------
-- SIMPLE_REPORT.PHONE_NUMBER --
--------------------------------

-- type | text
SECURITY LABEL FOR anon ON COLUMN phone_number.type
IS 'MASKED WITH VALUE ''MOBILE'' ';

-- number | text
SECURITY LABEL FOR anon ON COLUMN phone_number.number
IS 'MASKED WITH FUNCTION sr_faker.phone_number()';

----------------------------
-- SIMPLE_REPORT.PROVIDER --
----------------------------

-- first_name | text
SECURITY LABEL FOR anon ON COLUMN provider.first_name
IS 'MASKED WITH FUNCTION sr_faker.first_name()';

-- middle_name | text
SECURITY LABEL FOR anon ON COLUMN provider.middle_name
IS 'MASKED WITH FUNCTION sr_faker.middle_name()';

-- last_name | text
SECURITY LABEL FOR anon ON COLUMN provider.last_name
IS 'MASKED WITH FUNCTION sr_faker.last_name()';

-- suffix | text
SECURITY LABEL FOR anon ON COLUMN provider.suffix
IS 'MASKED WITH VALUE '''' ';

-- provider_id | text
SECURITY LABEL FOR anon ON COLUMN provider.provider_id
IS 'MASKED WITH FUNCTION sr_faker.provider_id()';

-- street | text
SECURITY LABEL FOR anon ON COLUMN provider.street
IS 'MASKED WITH VALUE sr_faker.street()';

-- city | text
SECURITY LABEL FOR anon ON COLUMN provider.city
IS 'MASKED WITH FUNCTION anon.fake_city()';

-- county | text
SECURITY LABEL FOR anon ON COLUMN provider.county
IS 'MASKED WITH FUNCTION sr_faker.county()';

-- state | text
SECURITY LABEL FOR anon ON COLUMN provider.state
IS 'MASKED WITH VALUE ''DC'' ';

-- postal_code | text
SECURITY LABEL FOR anon ON COLUMN provider.postal_code
IS 'MASKED WITH FUNCTION anon.random_zip()';

-- telephone | text
SECURITY LABEL FOR anon ON COLUMN provider.telephone
IS 'MASKED WITH FUNCTION sr_faker.phone_number()';

------------------------------
-- SIMPLE_REPORT.RESULT --
------------------------------

-- result_data | text
SECURITY LABEL FOR anon ON COLUMN result.result
IS 'MASKED WITH VALUE sr_faker.test_result()';

------------------------------
-- SIMPLE_REPORT.TEST_EVENT --
------------------------------

-- patient_data | jsonb
SECURITY LABEL FOR anon ON COLUMN test_event.patient_data
IS 'MASKED WITH FUNCTION sr_faker.jsonb_updater(patient_data,'
  '(''{race}'', ''"other"''),'
  '(''{role}'', ''"STUDENT"''),'
  '(''{email}'', to_jsonb(sr_faker.email())),'
  '(''{emails}'', ''[]''),'
  '(''{gender}'', ''"female"''),'
  '(''{suffix}'', ''null''),'
  '(''{address,city}'', to_jsonb(anon.fake_city())),'
  '(''{address,state}'', ''"OR"''),'
  '(''{address,county}'', to_jsonb(sr_faker.county())),'
  '(''{address,street}'', ''[]''),'
  '(''{address,postalCode}'', to_jsonb(anon.random_zip())),'
  '(''{country}'', ''"USA"''),'
  '(''{lastName}'', to_jsonb(sr_faker.last_name())),'
  '(''{birthDate}'', ''[]''),'
  '(''{ethnicity}'', ''"refused"''),'
  '(''{firstName}'', to_jsonb(sr_faker.first_name())),'
  '(''{telephone}'', to_jsonb(sr_faker.phone_number())),'
  '(''{middleName}'', ''null''),'
  '(''{phoneNumbers}'', ''[]''),'
  '(''{primaryPhone,type}'', ''"MOBILE"''),'
  '(''{primaryPhone,number}'', to_jsonb(sr_faker.phone_number())),'
  '(''{preferredLanguage}'', ''null''),'
  '(''{tribalAffiliation}'', ''[null]''),'
  '(''{testResultDelivery}'', ''null''),'
  '(''{employedInHealthcare}'', ''false''),'
  '(''{residentCongregateSetting}'', ''false'')'
')';

-- provider_data | jsonb
SECURITY LABEL FOR anon ON COLUMN test_event.provider_data
IS 'MASKED WITH FUNCTION sr_faker.jsonb_updater(provider_data,'
  '(''{suffix}'', ''""''),'
  '(''{address,city}'', ''null''),'
  '(''{address,state}'', ''null''),'
  '(''{address,county}'', ''null''),'
  '(''{address,street}'', ''[]''),'
  '(''{address,postalCode}'', ''null''),'
  '(''{lastName}'', to_jsonb(sr_faker.last_name())),'
  '(''{firstName}'', to_jsonb(sr_faker.first_name())),'
  '(''{telephone}'', to_jsonb(sr_faker.phone_number())),'
  '(''{middleName}'', ''""''),'
  '(''{providerId}'', to_jsonb(anon.random_string(10)))'
')';

-- result_data | text
SECURITY LABEL FOR anon ON COLUMN test_event.result
IS 'MASKED WITH VALUE sr_faker.test_result()';

-- survey_data | jsonb
SECURITY LABEL FOR anon ON COLUMN test_event.survey_data
IS 'MASKED WITH FUNCTION sr_faker.jsonb_updater(survey_data,'
  '(''{symptoms,25064002}'', ''false''),'
  '(''{symptoms,36955009}'', ''false''),'
  '(''{symptoms,43724002}'', ''false''),'
  '(''{symptoms,44169009}'', ''false''),'
  '(''{symptoms,49727002}'', ''false''),'
  '(''{symptoms,62315008}'', ''false''),'
  '(''{symptoms,64531003}'', ''false''),'
  '(''{symptoms,68235000}'', ''false''),'
  '(''{symptoms,68962001}'', ''false''),'
  '(''{symptoms,84229001}'', ''false''),'
  '(''{symptoms,103001002}'', ''false''),'
  '(''{symptoms,162397003}'', ''false''),'
  '(''{symptoms,230145002}'', ''false''),'
  '(''{symptoms,267036007}'', ''false''),'
  '(''{symptoms,422400008}'', ''false''),'
  '(''{symptoms,422587007}'', ''false''),'
  '(''{symptoms,426000000}'', ''false''),'
  '(''{firstTest}'', ''false''),'
  '(''{pregnancy}'', ''"60001007"''),'
  '(''{noSymptoms}'', ''false''),'
  '(''{priorTestDate}'', ''null''),'
  '(''{priorTestType}'', ''null''),'
  '(''{priorTestResult}'', ''null''),'
  '(''{symptomOnsetDate}'', ''[2020, 1, 1]'')'
')';	
