package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class CsvToFhirConverter {

  private static final String ALPHABET_REGEX = "^[a-zA-Z]+$";
  private final Function<Map<String, String>, TestResultRow> fileRowConstructor =
      TestResultRow::new;

  private final DeviceTypeRepository deviceTypeRepository;

  private final GitProperties gitProperties;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  private final Map<String, String> testResultToSnomedMap =
      Map.of(
          "Positive".toLowerCase(), "260373001",
          "Negative".toLowerCase(), "260415000",
          "Detected".toLowerCase(), "260373001",
          "Not Detected".toLowerCase(), "260415000",
          "Invalid Result".toLowerCase(), "455371000124106");

  private final Map<String, String> specimenTypeToSnomedMap =
      Map.of(
          "Nasal Swab".toLowerCase(), "445297001",
          "Nasopharyngeal Swab".toLowerCase(), "258500001",
          "Anterior Nares Swab".toLowerCase(), "697989009", // aka nasal
          "Throat Swab".toLowerCase(), "258529004", // Oropharyngeal
          "Oropharyngeal Swab".toLowerCase(), "258529004",
          "Whole Blood".toLowerCase(), "258580003",
          "Plasma".toLowerCase(), "119361006",
          "Serum".toLowerCase(), "119364003");

  public List<Bundle> convertToFhirBundles(InputStream csvStream, UUID orgId) {
    var testEvents = new ArrayList<Bundle>();
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
      var fileRow = (TestResultRow) fileRowConstructor.apply(row);

      testEvents.add(convertRowToFhirBundle(fileRow, orgId));
    }

    return testEvents;
  }

  private Bundle convertRowToFhirBundle(TestResultRow row, UUID orgId) {
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("M/d/yyyy[ HH:mm]");

    var patientAddr =
        new StreetAddress(
            row.getPatientStreet().value,
            row.getPatientStreet2().value,
            row.getPatientCity().value,
            row.getPatientState().value,
            row.getPatientZipCode().value,
            row.getPatientCounty().value);
    var testingLabAddr =
        new StreetAddress(
            row.getTestingLabStreet().value,
            row.getTestingLabStreet2().value,
            row.getTestingLabCity().value,
            row.getTestingLabState().value,
            row.getTestingLabZipCode().value,
            null);
    var providerAddr =
        new StreetAddress(
            row.getOrderingProviderStreet().value,
            row.getOrderingFacilityStreet2().value,
            row.getOrderingFacilityCity().value,
            row.getOrderingFacilityState().value,
            row.getOrderingProviderZipCode().value,
            null);
    var patient =
        FhirConverter.convertToPatient(
            row.getPatientId().value,
            new PersonName(
                row.getPatientFirstName().value,
                row.getPatientLastName().value,
                row.getPatientMiddleName().value,
                null),
            List.of(new PhoneNumber(PhoneType.MOBILE, row.getPatientPhoneNumber().value)),
            List.of(row.getPatientEmail().value),
            row.getPatientGender().value,
            LocalDate.parse(row.getPatientDob().value, dateTimeFormatter),
            patientAddr,
            DEFAULT_COUNTRY,
            row.getPatientRace().value,
            row.getPatientEthnicity().value,
            new ArrayList<>());
    var testingLabOrg =
        FhirConverter.convertToOrganization(
            orgId.toString(),
            row.getTestingLabName().value,
            row.getTestingLabPhoneNumber().value,
            null,
            testingLabAddr,
            DEFAULT_COUNTRY);

    Organization orderingFacility = null;
    if (row.getOrderingFacilityStreet().value != null
        || row.getOrderingFacilityStreet2().value != null
        || row.getOrderingFacilityCity().value != null
        || row.getOrderingFacilityState().value != null
        || row.getOrderingFacilityZipCode().value != null
        || row.getOrderingFacilityName().value != null
        || row.getOrderingFacilityPhoneNumber().value != null) {
      var orderingFacilityAddr =
          new StreetAddress(
              row.getOrderingFacilityStreet().value,
              row.getOrderingFacilityStreet2().value,
              row.getOrderingFacilityCity().value,
              row.getOrderingFacilityState().value,
              row.getOrderingFacilityZipCode().value,
              null);
      orderingFacility =
          FhirConverter.convertToOrganization(
              UUID.randomUUID().toString(),
              row.getOrderingFacilityName().value,
              row.getOrderingFacilityPhoneNumber().value,
              null,
              orderingFacilityAddr,
              DEFAULT_COUNTRY);
    }

    var practitioner =
        FhirConverter.convertToPractitioner(
            row.getOrderingProviderId().value,
            new PersonName(
                row.getOrderingProviderFirstName().value,
                row.getOrderingProviderLastName().value,
                row.getOrderingProviderMiddleName().value,
                null),
            row.getOrderingProviderPhoneNumber().value,
            providerAddr,
            DEFAULT_COUNTRY);

    var additionalDeviceData =
        deviceTypeRepository.findDeviceTypeByModelIgnoreCase(row.getEquipmentModelName().value);
    var manufacturer = additionalDeviceData != null ? additionalDeviceData.getManufacturer() : null;
    var deviceId =
        additionalDeviceData != null ? additionalDeviceData.getInternalId() : UUID.randomUUID();
    var device =
        FhirConverter.convertToDevice(
            manufacturer, row.getEquipmentModelName().value, deviceId.toString());

    var specimen =
        FhirConverter.convertToSpecimen(
            getSpecimenTypeSnomed(row.getSpecimenType().value),
            getDescriptionValue(row.getSpecimenType().value),
            null,
            null,
            UUID.randomUUID().toString());

    var observation =
        List.of(
            FhirConverter.convertToObservation(
                row.getTestPerformedCode().value,
                null,
                getTestResultSnomed(row.getTestResult().value),
                mapTestResultStatusToSRValue(row.getTestResultStatus().value),
                null,
                UUID.randomUUID().toString(),
                getDescriptionValue(row.getTestResult().value)));

    var serviceRequest =
        FhirConverter.convertToServiceRequest(
            ServiceRequest.ServiceRequestStatus.ACTIVE,
            row.getTestPerformedCode().value,
            UUID.randomUUID().toString());

    var diagnosticReport =
        FhirConverter.convertToDiagnosticReport(
            mapTestResultStatusToFhirValue(row.getTestResultStatus().value),
            row.getTestPerformedCode().value,
            UUID.randomUUID().toString());

    var testDate = LocalDate.parse(row.getTestResultDate().value, dateTimeFormatter);
    return FhirConverter.createFhirBundle(
        patient,
        testingLabOrg,
        orderingFacility,
        practitioner,
        device,
        specimen,
        observation,
        serviceRequest,
        diagnosticReport,
        Date.from(testDate.atStartOfDay(ZoneId.systemDefault()).toInstant()),
        new Date(),
        gitProperties,
        processingModeCode);
  }

  private String getTestResultSnomed(String input) {
    if (input.matches(ALPHABET_REGEX)) {
      return testResultToSnomedMap.get(input.toLowerCase());
    }
    return input;
  }

  private String getSpecimenTypeSnomed(String input) {
    if (input.matches(ALPHABET_REGEX)) {
      return specimenTypeToSnomedMap.get(input.toLowerCase());
    }
    return input;
  }

  private String getDescriptionValue(String input) {
    if (input.matches(ALPHABET_REGEX)) {
      return input;
    }
    return null; // vs empty string?
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
}
