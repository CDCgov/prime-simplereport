INSERT INTO simple_report.test_event_metadata (
    internal_id,
    created_at,
    created_by,
    updated_at,
    updated_by,
    test_event_id,
    test_event_created_at,
    test_event_created_by,
    test_event_updated_at,
    test_event_updated_by,
    organization_id,
    facility_id,
    provider_id,
    report_type,
    destination,
    format,
    conditions,
    test_ordered_code,
    correction_status,
    original_test_order_id
)
SELECT
    gen_random_uuid(), -- internal_id
    NOW(), -- created_at
    test_event.created_by, -- created_by (is pulling this from test_event correct?)
    NOW(), -- updated_at
    test_event.updated_by, -- updated_by (is pulling this from test_event correct?)
    test_event.internal_id, -- test_event_id
    test_event.created_at, -- test_event_created_at
    test_event.created_by, -- test_event_created_by
    test_event.updated_at, -- test_event_updated_at
    test_event.updated_by, -- test_event_updated_by
    test_event.organization_id, -- organization_id
    test_event.facility_id, -- facility_id
    test_event.provider_data->>'providerId' as provider_id, -- provider_id
    'ELR', -- report_type
    'ReportStream', -- destination
    'FHIR', -- format
    ARRAY(SELECT disease_id FROM simple_report.supported_disease AS SD
    JOIN simple_report.result AS R ON R.disease_id = SD.internal_id
    WHERE R.test_event_id = test_event.internal_id), -- conditions (disease names array)
    (SELECT test_ordered_loinc_code FROM simple_report.device_type_disease AS DTD
    WHERE DTD.device_type_id = test_event.device_type_id), -- test_ordered_code
    test_event.correction_status, -- correction_status
    test_event.test_order_id -- original_test_order_id
FROM
    simple_report.test_event AS test_event;