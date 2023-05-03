package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAOEObservation;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.converter.ConvertToObservationProps;
import gov.cdc.usds.simplereport.api.converter.ConvertToPatientProps;
import gov.cdc.usds.simplereport.api.converter.CreateFhirBundleProps;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
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
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.function.Function;
import java.util.stream.Collectors;
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
public class BulkUploadResultsToFhir {

  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";
  private static final String SNOMED_REGEX = "^[0-9]{9}$";
  private final Function<Map<String, String>, TestResultRow> fileRowConstructor =
      TestResultRow::new;

  private final DeviceTypeRepository deviceTypeRepository;

  private final GitProperties gitProperties;

  private List<DeviceType> availableDevices;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();

  private final Map<String, String> testResultToSnomedMap =
      Map.of(
          "Positive".toLowerCase(), "260373001",
          "Negative".toLowerCase(), "260415000",
          "Detected".toLowerCase(), "260373001",
          "Not Detected".toLowerCase(), "260415000",
          "Invalid Result".toLowerCase(), "455371000124106");

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

  public List<String> convertToFhirBundles(InputStream csvStream, UUID orgId) {
    var futureTestEvents = new ArrayList<CompletableFuture<String>>();
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);
    availableDevices = deviceTypeRepository.findAllByIsDeletedFalse();
    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        // anything that would land here should have been caught and handled by the file validator
        log.error("Unable to parse csv.", ex);
        continue;
      }
      var fileRow = fileRowConstructor.apply(row);

      var future =
          CompletableFuture.supplyAsync(() -> convertRowToFhirBundle(fileRow, orgId))
              .thenApply(parser::encodeResourceToString);
      futureTestEvents.add(future);
    }

    return futureTestEvents.stream()
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
        .collect(Collectors.toList());
  }

  private Bundle convertRowToFhirBundle(TestResultRow row, UUID orgId) {
    DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("M/d/yyyy[ HH:mm]");

    var testEventId = UUID.randomUUID().toString();
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
            row.getOrderingProviderStreet2().value,
            row.getOrderingProviderCity().value,
            row.getOrderingProviderState().value,
            row.getOrderingProviderZipCode().value,
            null);

    var patient =
        FhirConverter.convertToPatient(
            ConvertToPatientProps.builder()
                .id(row.getPatientId().value)
                .name(
                    new PersonName(
                        row.getPatientFirstName().value,
                        row.getPatientLastName().value,
                        row.getPatientMiddleName().value,
                        null))
                .phoneNumbers(
                    List.of(new PhoneNumber(PhoneType.MOBILE, row.getPatientPhoneNumber().value)))
                .emails(List.of(row.getPatientEmail().value))
                .gender(row.getPatientGender().value)
                .dob(LocalDate.parse(row.getPatientDob().value, dateTimeFormatter))
                .address(patientAddr)
                .country(DEFAULT_COUNTRY)
                .race(row.getPatientRace().value)
                .ethnicity(row.getPatientEthnicity().value)
                .tribalAffiliations(new ArrayList<>())
                .build());

    var testingLabOrg =
        FhirConverter.convertToOrganization(
            orgId.toString(),
            row.getTestingLabName().value,
            row.getTestingLabClia().value,
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
              row.getTestingLabClia().value,
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
                row.getOrderingProviderMiddleName().value,
                row.getOrderingProviderLastName().value,
                null),
            row.getOrderingProviderPhoneNumber().value,
            providerAddr,
            DEFAULT_COUNTRY,
            row.getOrderingProviderId().value);

    String equipmentUid = null;
    String testKitNameId = null;
    String manufacturer = null;
    String diseaseName = null;
    UUID deviceId = UUID.randomUUID();
    var testPerformedCode = row.getTestPerformedCode().value;
    var modelName = row.getEquipmentModelName().value;
    var matchingDevices =
        availableDevices.stream()
            .filter(device -> device.getModel().equalsIgnoreCase(modelName))
            .filter(
                device ->
                    device.getSupportedDiseaseTestPerformed().stream()
                        .anyMatch(
                            disease ->
                                Objects.equals(
                                    disease.getTestPerformedLoincCode(), testPerformedCode)))
            .toList();

    if (matchingDevices.size() == 1) {
      var deviceType = matchingDevices.get(0);
      Optional<DeviceTypeDisease> deviceTypeDisease =
          deviceType.getSupportedDiseaseTestPerformed().stream()
              .filter(code -> Objects.equals(code.getTestPerformedLoincCode(), testPerformedCode))
              .findFirst();
      manufacturer = deviceType.getManufacturer();
      equipmentUid = deviceTypeDisease.map(DeviceTypeDisease::getEquipmentUid).orElse(null);
      testKitNameId = deviceTypeDisease.map(DeviceTypeDisease::getTestkitNameId).orElse(null);
      deviceId = deviceTypeDisease.map(DeviceTypeDisease::getInternalId).orElse(deviceId);
      var supportedDisease =
          deviceTypeDisease.map(DeviceTypeDisease::getSupportedDisease).orElse(null);
      diseaseName = supportedDisease != null ? supportedDisease.getName() : null;
    } else if (matchingDevices.isEmpty()) {
      log.info(
          "No device found for model ("
              + modelName
              + ") and test performed code ("
              + testPerformedCode
              + ")");
    } else {
      log.info(
          "More than one device found for model ("
              + modelName
              + ") and test performed code ("
              + testPerformedCode
              + ")");
    }

    var device = FhirConverter.convertToDevice(manufacturer, modelName, deviceId.toString());

    var specimen =
        FhirConverter.convertToSpecimen(
            getSpecimenTypeSnomed(row.getSpecimenType().value),
            getDescriptionValue(row.getSpecimenType().value),
            null,
            null,
            UUID.randomUUID().toString(),
            UUID.randomUUID().toString());

    var observation =
        List.of(
            FhirConverter.convertToObservation(
                ConvertToObservationProps.builder()
                    .diseaseCode(row.getTestPerformedCode().value)
                    .diseaseName(diseaseName)
                    .resultCode(getTestResultSnomed(row.getTestResult().value))
                    .correctionStatus(mapTestResultStatusToSRValue(row.getTestResultStatus().value))
                    .correctionReason(null)
                    .id(UUID.randomUUID().toString())
                    .resultDescription(
                        Translators.convertConceptCodeToConceptName(
                            getDescriptionValue(row.getTestResult().value)))
                    .testkitNameId(testKitNameId)
                    .equipmentUid(equipmentUid)
                    .deviceModel(row.getEquipmentModelName().value)
                    .build()));

    LocalDate symptomOnsetDate = null;
    if (row.getIllnessOnsetDate().value != null
        && !row.getIllnessOnsetDate().value.trim().isBlank()) {
      try {
        symptomOnsetDate = LocalDate.parse(row.getIllnessOnsetDate().value, dateTimeFormatter);
      } catch (DateTimeParseException e) {
        // empty values for optional fields come through as empty strings, not null
        log.error("Unable to parse date from CSV.");
      }
    }

    Boolean symptomatic = null;
    if (row.getSymptomaticForDisease().value != null) {
      symptomatic = yesNoToBooleanMap.get(row.getSymptomaticForDisease().value.toLowerCase());
    }

    var aoeObservations = convertToAOEObservation(testEventId, symptomatic, symptomOnsetDate);

    var serviceRequest =
        FhirConverter.convertToServiceRequest(
            ServiceRequest.ServiceRequestStatus.ACTIVE,
            testPerformedCode,
            UUID.randomUUID().toString());

    var testDate = LocalDate.parse(row.getTestResultDate().value, dateTimeFormatter);
    var diagnosticReport =
        FhirConverter.convertToDiagnosticReport(
            mapTestResultStatusToFhirValue(row.getTestResultStatus().value),
            testPerformedCode,
            testEventId,
            Date.from(testDate.atStartOfDay(ZoneId.systemDefault()).toInstant()),
            new Date());

    return FhirConverter.createFhirBundle(
        CreateFhirBundleProps.builder()
            .patient(patient)
            .testingLab(testingLabOrg)
            .orderingFacility(orderingFacility)
            .practitioner(practitioner)
            .device(device)
            .specimen(specimen)
            .resultObservations(observation)
            .aoeObservations(aoeObservations)
            .serviceRequest(serviceRequest)
            .diagnosticReport(diagnosticReport)
            .currentDate(new Date())
            .gitProperties(gitProperties)
            .processingId(processingModeCode)
            .build());
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
    } else if (input.matches(SNOMED_REGEX)) {
      return input;
    }
    return null;
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
