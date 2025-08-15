-- delete_test_data


DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT internal_id INTO test_user_id FROM simple_report.api_user WHERE login_email = 'bobbity@example.com';

    DELETE FROM simple_report.test_event WHERE created_by = test_user_id;
    DELETE FROM simple_report.test_order WHERE created_by = test_user_id;
    DELETE FROM simple_report.person WHERE created_by = test_user_id;
    DELETE FROM simple_report.facility WHERE created_by = test_user_id;
    DELETE FROM simple_report.organization WHERE created_by = test_user_id;
    DELETE FROM simple_report.device_type WHERE created_by = test_user_id;

    DELETE FROM simple_report.api_user WHERE internal_id = test_user_id;
END $$;


