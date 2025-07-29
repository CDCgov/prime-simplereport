-- Complete test data import script (direct import, no temp tables)
-- This script imports all referenced entities and test data, linking them properly
-- Assumes CSVs have headers matching the columns below
-- Wrapped in transaction for atomicity

BEGIN;

-- Import users (ApiUser)
\copy simple_report.api_user (internal_id, created_at, updated_at, login_email, last_seen, first_name, middle_name, last_name) FROM '1000_users.csv' WITH (FORMAT csv, HEADER true)

-- Import organizations
\copy simple_report.organization (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, organization_name, organization_type, identity_verified, organization_external_id) FROM '1000_orgs.csv' WITH (FORMAT csv, HEADER true)

-- Import device types
\copy simple_report.device_type (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, name, manufacturer, model, test_length) FROM '1000_device_types.csv' WITH (FORMAT csv, HEADER true)

-- Import facilities
\copy simple_report.facility (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, organization_id, facility_name, clia_number, default_device_type_id, street, city, county, state, postal_code, telephone) FROM '1000_facilities.csv' WITH (FORMAT csv, HEADER true)

-- Import persons (patients)
\copy simple_report.person (internal_id, created_at, created_by, updated_at, updated_by, is_deleted, organization_id, facility_id, first_name, middle_name, last_name, suffix, race, gender, ethnicity, lookup_id, birth_date, street, city, county, state, postal_code, email, employed_in_healthcare, role, resident_congregate_setting, tribal_affiliation, country, preferred_language, test_result_delivery_preference, emails, gender_identity) FROM '1000_persons.csv' WITH (FORMAT csv, HEADER true)

-- Import test orders
\copy simple_report.test_order (internal_id, organization_id, facility_id, patient_id, created_at, created_by, updated_at, updated_by, order_status, test_event_id) FROM '1000_orders.csv' WITH (FORMAT csv, HEADER true)

-- Import test events
\copy simple_report.test_event (internal_id, organization_id, facility_id, patient_id, created_at, created_by, updated_at, updated_by, test_order_id, correction_status, reason_for_correction) FROM '1000_events.csv' WITH (FORMAT csv, HEADER true)

-- Verify the import
DO $$
    DECLARE
        imported_orders_count INTEGER;
        imported_events_count INTEGER;
        linked_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO imported_orders_count
        FROM simple_report.test_order
        WHERE created_at >= '2025-06-30';

        SELECT COUNT(*) INTO imported_events_count
        FROM simple_report.test_event
        WHERE created_at >= '2025-06-30';

        SELECT COUNT(*) INTO linked_count
        FROM simple_report.test_order o
                 JOIN simple_report.test_event e ON o.test_event_id = e.internal_id
        WHERE o.created_at >= '2025-06-30';

        RAISE NOTICE 'Import Summary:';
        RAISE NOTICE '  Test Orders imported: %', imported_orders_count;
        RAISE NOTICE '  Test Events imported: %', imported_events_count;
        RAISE NOTICE '  Properly linked: %', linked_count;
    END $$;

-- Show a sample of imported data with proper linkage
SELECT
    o.internal_id as order_id,
    e.internal_id as event_id,
    o.created_at,
    o.patient_id,
    o.organization_id,
    o.order_status,
    e.correction_status
FROM simple_report.test_order o
         LEFT JOIN simple_report.test_event e ON o.test_event_id = e.internal_id
WHERE o.created_at >= '2025-06-30'
ORDER BY o.created_at DESC
LIMIT 5;

COMMIT;