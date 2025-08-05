package gov.cdc.usds.simplereport.utils;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.extractSubstringsGenderOfSexualPartners;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

public class BulkUploadResultsToHL7 {
    public String convertToHL7BatchMessage(InputStream csvStream) {
        HashMap<String, Integer> diseasesReported = new HashMap<>();
        var futureTestEvents = new ArrayList<CompletableFuture<String>>();
        final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

        while (valueIterator.hasNext()) {
            final Map<String, String> row = getNextRow(valueIterator);
            TestResultRow fileRow = new TestResultRow(row);

            var future = CompletableFuture.supplyAsync(() -> convertRowToHL7(fileRow));
            futureTestEvents.add(future);
        }

        return "";
    }

    private String convertRowToHL7(TestResultRow row) {
        var testId = row.getAccessionNumber().getValue();

        var patientInput = getPatientInput(row);
    }

    private PatientReportInput getPatientInput(TestResultRow row) {
        return PatientReportInput.builder()
            .firstName(row.getPatientFirstName().getValue())
            .middleName(row.getPatientMiddleName().getValue())
            .lastName(row.getPatientLastName().getValue())
            .email(row.getPatientEmail().getValue())
            .phone(row.getPatientPhoneNumber().getValue())
            .street(row.getPatientStreet().getValue())
            .streetTwo(row.getPatientStreet2().getValue())
            .city(row.getPatientCity().getValue())
            .county(row.getPatientCounty().getValue())
            .state(row.getPatientState().getValue())
            .zipCode(row.getPatientZipCode().getValue())
            .sex(row.getPatientGender().getValue())
            .dateOfBirth(LocalDate.parse(row.getPatientDob().getValue(), DATE_TIME_FORMATTER))
            .race(row.getPatientRace().getValue())
            .ethnicity(row.getPatientEthnicity().getValue())
            .patientId(row.getPatientId().getValue())
            .build();
    }

    private ProviderReportInput getProviderInput(TestResultRow row) {
        return ProviderReportInput.builder()
            .firstName(row.getOrderingProviderFirstName().getValue())
            .middleName(row.getOrderingProviderMiddleName().getValue())
            .lastName(row.getOrderingProviderLastName().getValue())
            .npi(row.getOrderingProviderId().getValue())
            .street(row.getOrderingProviderStreet().getValue())
            .streetTwo(row.getOrderingProviderStreet2().getValue())
            .city(row.getOrderingProviderCity().getValue())
            .state(row.getOrderingProviderState().getValue())
            .zipCode(row.getOrderingProviderZipCode().getValue())
            .phone(row.getOrderingProviderPhoneNumber().getValue())
            .build();
    }

    private FacilityReportInput getFacilityReportInput(TestResultRow row) {
        return FacilityReportInput.builder()
            .name(row.getTestingLabName().getValue())
            .clia(row.getTestingLabClia().getValue())
            .street(row.getTestingLabStreet().getValue())
            .streetTwo(row.getTestingLabStreet2().getValue())
            .city(row.getTestingLabCity().getValue())
            .state(row.getTestingLabState().getValue())
            .zipCode(row.getTestingLabZipCode().getValue())
            .phone(row.getTestingLabPhoneNumber().getValue())
            .build();
    }

    private SpecimenInput getSpecimenInput(TestResultRow row) {
        return SpecimenInput.builder()
            .snomedTypeCode(row.getSpecimenType().getValue())
            .snomedDisplay(null)
            .collectionDate(
                Date.from(Instant.from(LocalDate.parse(row.getSpecimenCollectionDate().getValue(), DATE_TIME_FORMATTER)))
            )
            .receivedDate(
                Date.from(Instant.from(LocalDate.parse(row.getTestingLabSpecimenReceivedDate().getValue(), DATE_TIME_FORMATTER)))
            )
            .build();
    }
}
