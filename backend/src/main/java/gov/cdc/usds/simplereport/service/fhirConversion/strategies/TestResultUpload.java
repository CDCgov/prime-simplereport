package gov.cdc.usds.simplereport.service.fhirConversion.strategies;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.converter.*;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.service.fhirConversion.Strategy;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.MultiplexUtils;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static java.util.Collections.emptyList;

import org.hl7.fhir.r4.model.Bundle;

@Slf4j
@RequiredArgsConstructor
public class TestResultUpload implements Strategy {
    private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";
    private static final String SNOMED_REGEX = "(^\\d{9}$)|(^\\d{15}$)";
    private final GitProperties gitProperties;
    private final UUIDGenerator uuidGenerator;
    private final DateGenerator dateGenerator;
    private final FhirConverter fhirConverter;

    private final ResultsUploaderCachingService resultsUploaderCachingService;
    final FhirContext ctx = FhirContext.forR4();
    final IParser parser = ctx.newJsonParser();

    public static final String PROCESSING_MODE_CODE_COLUMN_NAME = "processing_mode_code";
    private static final String ORDER_TEST_DATE_COLUMN_NAME = "order_test_date";
    private static final String SPECIMEN_COLLECTION_DATE_COLUMN_NAME = "specimen_collection_date";
    private static final String TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME =
            "testing_lab_specimen_received_date";
    private static final String TEST_RESULT_DATE_COLUMN_NAME = "test_result_date";
    private static final String DATE_RESULT_RELEASED_COLUMN_NAME = "date_result_released";

    public static final String SPECIMEN_TYPE_COLUMN_NAME = "specimen_type";

    private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";


    private static final Map<String, Boolean> yesNoToBooleanMap = new HashMap<>();

    static {
        yesNoToBooleanMap.put("Y".toLowerCase(), Boolean.TRUE);
        yesNoToBooleanMap.put("YES".toLowerCase(), Boolean.TRUE);
        yesNoToBooleanMap.put("N".toLowerCase(), Boolean.FALSE);
        yesNoToBooleanMap.put("NO".toLowerCase(), Boolean.FALSE);
        yesNoToBooleanMap.put("U".toLowerCase(), null);
        yesNoToBooleanMap.put("UNK".toLowerCase(), null);
        yesNoToBooleanMap.put(null, null);
        yesNoToBooleanMap.put("", null);
    }

    @Value("${simple-report.processing-mode-code:P}")
    private String processingModeCodeValue;

    @Value("${simple-report.processing-mode-code:P}")
    private String processingModeCode = "P";

    private final Map<String, String> testResultToSnomedMap =
            Map.of(
                    "Positive".toLowerCase(), "260373001",
                    "Negative".toLowerCase(), "260415000",
                    "Detected".toLowerCase(), "260373001",
                    "Not Detected".toLowerCase(), "260415000",
                    "Invalid Result".toLowerCase(), "455371000124106");

    @Override
    public List<String> convertToFhirBundles(InputStream csvStream, UUID orgId) {
        var futureTestEvents = new ArrayList<CompletableFuture<String>>();
        final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);
        while (valueIterator.hasNext()) {
            final Map<String, String> row;
            try {
                row = getNextRow(valueIterator);
            } catch (CsvProcessingException ex) {
                // anything that would land here should have been caught and handled by the file validator
                log.error("Unable to parse csv.", ex);
                continue;
            }
            var fileRow = new TestResultRow(row);

            var future =
                    CompletableFuture.supplyAsync(() -> convertRowToFhirBundle(fileRow, orgId))
                            .thenApply(parser::encodeResourceToString);
            futureTestEvents.add(future);
        }

        List<String> bundles =
                futureTestEvents.stream()
                        .map(
                                future -> {
                                    try {
                                        return future.get();
                                    } catch (InterruptedException | ExecutionException e) {
                                        log.error("Bulk upload failure to convert to fhir.", e);
                                        Thread.currentThread().interrupt();
                                        throw new CsvProcessingException("Unable to process file.");
                                    }
                                })
                        .toList();

        // Clear cache to free memory
        resultsUploaderCachingService.clearAddressTimezoneLookupCache();

        return bundles;
    }

    @Override
    public List<String> convertRowToFhirBundle(FileRow csvRowStream, UUID orgId) {

    }

    public Map<String, String> transformCsvRow(Map<String, String> row) {
        if (!"P".equals(processingModeCodeValue)
                && !row.containsKey(PROCESSING_MODE_CODE_COLUMN_NAME)) {
            row.put(PROCESSING_MODE_CODE_COLUMN_NAME, processingModeCodeValue);
        }

        var updatedSpecimenType =
                modifyRowSpecimenNameToSNOMED(row.get(SPECIMEN_TYPE_COLUMN_NAME).toLowerCase());

        var testingLabAddress =
                new StreetAddress(
                        row.get("testing_lab_street"),
                        row.get("testing_lab_street2"),
                        row.get("testing_lab_city"),
                        row.get("testing_lab_state"),
                        row.get("testing_lab_zip_code"),
                        null);
        var providerAddress =
                new StreetAddress(
                        row.get("ordering_provider_street"),
                        row.get("ordering_provider_street2"),
                        row.get("ordering_provider_city"),
                        row.get("ordering_provider_state"),
                        row.get("ordering_provider_zip_code"),
                        null);

        var testResultDate =
                convertToZonedDateTime(
                        row.get(TEST_RESULT_DATE_COLUMN_NAME),
                        resultsUploaderCachingService,
                        testingLabAddress);

        var orderTestDate =
                convertToZonedDateTime(
                        row.get(ORDER_TEST_DATE_COLUMN_NAME), resultsUploaderCachingService, providerAddress);

        var specimenCollectionDate =
                StringUtils.isNotBlank(row.get(SPECIMEN_COLLECTION_DATE_COLUMN_NAME))
                        ? convertToZonedDateTime(
                        row.get(SPECIMEN_COLLECTION_DATE_COLUMN_NAME),
                        resultsUploaderCachingService,
                        providerAddress)
                        : orderTestDate;

        var testingLabSpecimenReceivedDate =
                StringUtils.isNotBlank(row.get(TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME))
                        ? convertToZonedDateTime(
                        row.get(TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME),
                        resultsUploaderCachingService,
                        testingLabAddress)
                        : orderTestDate;

        var dateResultReleased =
                StringUtils.isNotBlank(row.get(DATE_RESULT_RELEASED_COLUMN_NAME))
                        ? convertToZonedDateTime(
                        row.get(DATE_RESULT_RELEASED_COLUMN_NAME),
                        resultsUploaderCachingService,
                        testingLabAddress)
                        : testResultDate;

        row.put(SPECIMEN_TYPE_COLUMN_NAME, updatedSpecimenType);
        row.put(TEST_RESULT_DATE_COLUMN_NAME, testResultDate.toOffsetDateTime().toString());
        row.put(ORDER_TEST_DATE_COLUMN_NAME, orderTestDate.toOffsetDateTime().toString());
        row.put(
                SPECIMEN_COLLECTION_DATE_COLUMN_NAME, specimenCollectionDate.toOffsetDateTime().toString());
        row.put(
                TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME,
                testingLabSpecimenReceivedDate.toOffsetDateTime().toString());
        row.put(DATE_RESULT_RELEASED_COLUMN_NAME, dateResultReleased.toOffsetDateTime().toString());

        return row;
    }

    private Bundle convertTestResultRowToFhirBundle(TestResultRow row, UUID orgId) {

    }


    private String getEthnicityLiteral(String input) {
        if (!input.matches(ALPHABET_REGEX)) {
            List<String> ethnicityList = PersonUtils.ETHNICITY_MAP.get(input);
            return ethnicityList != null ? ethnicityList.get(1) : input;
        }
        return input;
    }

    private String getRaceLiteral(String input) {
        if (!input.matches(ALPHABET_REGEX)) {
            return PersonUtils.raceMap.get(input);
        }
        return input;
    }

    private String getTestResultSnomed(String input) {
        if (input.matches(ALPHABET_REGEX)) {
            return testResultToSnomedMap.get(input.toLowerCase());
        }
        return input;
    }

    private String getSpecimenTypeSnomed(String input) {
        if (input.matches(ALPHABET_REGEX)) {
            return resultsUploaderCachingService
                    .getSpecimenTypeNameToSNOMEDMap()
                    .get(input.toLowerCase());
        } else if (input.matches(SNOMED_REGEX)) {
            return input;
        }
        return null;
    }

    private String getSpecimenTypeName(String specimenSNOMED) {
        if (specimenSNOMED != null) {
            return resultsUploaderCachingService.getSNOMEDToSpecimenTypeNameMap().get(specimenSNOMED);
        }
        return null;
    }

    private DiagnosticReport.DiagnosticReportStatus mapTestResultStatusToFhirValue(String input) {
        switch (input) {
            case "C":
                return DiagnosticReport.DiagnosticReportStatus.CORRECTED;
            case "F":
            default:
                return DiagnosticReport.DiagnosticReportStatus.FINAL;
        }
    }

    private TestCorrectionStatus mapTestResultStatusToSRValue(String input) {
        switch (input) {
            case "C":
                return TestCorrectionStatus.CORRECTED;
            case "F":
            default:
                return TestCorrectionStatus.ORIGINAL;
        }
    }

    private String modifyRowSpecimenNameToSNOMED(String specimenTypeName) {
        var snomedMap = resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap();
        if (specimenTypeName.matches(ALPHABET_REGEX)) {
            return snomedMap.get(specimenTypeName);
        }
        return specimenTypeName;
    }
}
