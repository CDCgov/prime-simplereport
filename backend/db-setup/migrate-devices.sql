UPDATE simple_report.device_type
SET loinc_code = '94534-5'
WHERE name='Abbott IDNow';

UPDATE simple_report.device_type 
SET model = 'BinaxNOW COVID-19 Ag Card'
WHERE name='Abbott BinaxNow';

UPDATE simple_report.device_type
SET loinc_code = '95209-3'
WHERE name='Quidel Sofia 2';

UPDATE simple_report.device_type
SET manufacturer = 'LumiraDx UK Ltd.', model = 'LumiraDx SARS-CoV-2 Ag Test*', loinc_code = '95209-3'
WHERE name='LumiraDX';