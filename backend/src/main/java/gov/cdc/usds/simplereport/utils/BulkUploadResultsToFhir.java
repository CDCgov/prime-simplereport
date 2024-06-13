package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.AOE_EMPLOYED_IN_HEALTHCARE_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_EMPLOYED_IN_HEALTHCARE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_HOSPITALIZED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_ICU;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.diseaseSpecificLoincMap;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.getGenderIdentityAbbreviationMap;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.getResidenceTypeMap;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static gov.cdc.usds.simplereport.utils.ResultUtils.mapTestResultStatusToSRValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.extractSubstringsGenderOfSexualPartners;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static java.util.Collections.emptyList;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.converter.ConditionAgnosticConvertToDiagnosticReportProps;
import gov.cdc.usds.simplereport.api.converter.ConditionAgnosticConvertToObservationProps;
import gov.cdc.usds.simplereport.api.converter.ConditionAgnosticConvertToPatientProps;
import gov.cdc.usds.simplereport.api.converter.ConditionAgnosticCreateFhirBundleProps;
import gov.cdc.usds.simplereport.api.converter.ConvertToObservationProps;
import gov.cdc.usds.simplereport.api.converter.ConvertToPatientProps;
import gov.cdc.usds.simplereport.api.converter.ConvertToSpecimenProps;
import gov.cdc.usds.simplereport.api.converter.CreateFhirBundleProps;
import gov.cdc.usds.simplereport.api.converter.FhirConverter;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.SnomedConceptRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.owasp.encoder.Encode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class BulkUploadResultsToFhir {

  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";
  private static final String SNOMED_REGEX = "(^\\d{9}$)|(^\\d{15}$)";
  private final ResultsUploaderCachingService resultsUploaderCachingService;
  private final GitProperties gitProperties;
  private final UUIDGenerator uuidGenerator;
  private final DateGenerator dateGenerator;
  private final FhirConverter fhirConverter;

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

  public FHIRBundleRecord convertToFhirBundles(InputStream csvStream, UUID orgId) {
    // create bundle meta
    HashMap<String, Integer> diseasesReported = new HashMap<>();
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
      TestResultRow fileRow = new TestResultRow(row);

      Optional<String> disease =
          getDiseaseFromDeviceSpecs(
              fileRow.getEquipmentModelName().getValue(),
              fileRow.getTestPerformedCode().getValue());
      if (disease.isPresent()) {
        diseasesReported.put(disease.get(), diseasesReported.getOrDefault(disease.get(), 0) + 1);
      }

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
            .map(line -> line.replace(System.getProperty("line.separator"), " "))
            .toList();

    // Clear cache to free memory
    resultsUploaderCachingService.clearAddressTimezoneLookupCache();
    return new FHIRBundleRecord(bundles, diseasesReported);
  }

  public List<String> convertToConditionAgnosticFhirBundles(InputStream csvStream) {
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
      var fileRow = new ConditionAgnosticResultRow(row);

      var future =
          CompletableFuture.supplyAsync(() -> convertConditionAgnosticRowToFhirBundle(fileRow))
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
        .map(line -> line.replace(System.getProperty("line.separator"), " "))
        .toList();
  }

  private Bundle convertRowToFhirBundle(TestResultRow row, UUID orgId) {
    var testEventId = row.getAccessionNumber().getValue();

    var patientAddr =
        new StreetAddress(
            row.getPatientStreet().getValue(),
            row.getPatientStreet2().getValue(),
            row.getPatientCity().getValue(),
            row.getPatientState().getValue(),
            row.getPatientZipCode().getValue(),
            row.getPatientCounty().getValue());
    var testingLabAddr =
        new StreetAddress(
            row.getTestingLabStreet().getValue(),
            row.getTestingLabStreet2().getValue(),
            row.getTestingLabCity().getValue(),
            row.getTestingLabState().getValue(),
            row.getTestingLabZipCode().getValue(),
            null);
    var providerAddr =
        new StreetAddress(
            row.getOrderingProviderStreet().getValue(),
            row.getOrderingProviderStreet2().getValue(),
            row.getOrderingProviderCity().getValue(),
            row.getOrderingProviderState().getValue(),
            row.getOrderingProviderZipCode().getValue(),
            null);

    // Must be zoned because DateTimeType fields on FHIR bundle objects require
    // a Date as a specific moment of time. Otherwise, parsing the string to a
    // LocalDateTime cannot accurately place it on a timeline because there is
    // no way to know if 00:00 refers to 12am ET or 12am PT or 12am UTC, each of
    // which is a different moment of time and potentially even a different day
    var testResultDate =
        convertToZonedDateTime(
            row.getTestResultDate().getValue(), resultsUploaderCachingService, providerAddr);

    var orderTestDate =
        convertToZonedDateTime(
            row.getOrderTestDate().getValue(), resultsUploaderCachingService, providerAddr);

    var specimenCollectionDate =
        StringUtils.isNotBlank(row.getSpecimenCollectionDate().getValue())
            ? convertToZonedDateTime(
                row.getSpecimenCollectionDate().getValue(),
                resultsUploaderCachingService,
                providerAddr)
            : orderTestDate;

    var testingLabSpecimenReceivedDate =
        StringUtils.isNotBlank(row.getTestingLabSpecimenReceivedDate().getValue())
            ? convertToZonedDateTime(
                row.getTestingLabSpecimenReceivedDate().getValue(),
                resultsUploaderCachingService,
                providerAddr)
            : orderTestDate;

    var dateResultReleased =
        StringUtils.isNotBlank(row.getDateResultReleased().getValue())
            ? convertToZonedDateTime(
                row.getDateResultReleased().getValue(), resultsUploaderCachingService, providerAddr)
            : testResultDate;

    List<PhoneNumber> patientPhoneNumbers =
        StringUtils.isNotBlank(row.getPatientPhoneNumber().getValue())
            ? List.of(new PhoneNumber(PhoneType.MOBILE, row.getPatientPhoneNumber().getValue()))
            : emptyList();
    List<String> patientEmails =
        StringUtils.isNotBlank(row.getPatientEmail().getValue())
            ? List.of(row.getPatientEmail().getValue())
            : emptyList();

    var patient =
        fhirConverter.convertToPatient(
            ConvertToPatientProps.builder()
                .id(row.getPatientId().getValue())
                .name(
                    new PersonName(
                        row.getPatientFirstName().getValue(),
                        row.getPatientMiddleName().getValue(),
                        row.getPatientLastName().getValue(),
                        null))
                .phoneNumbers(patientPhoneNumbers)
                .emails(patientEmails)
                .gender(row.getPatientGender().getValue())
                .dob(LocalDate.parse(row.getPatientDob().getValue(), DATE_TIME_FORMATTER))
                .address(patientAddr)
                .country(DEFAULT_COUNTRY)
                .race(getRaceLiteral(row.getPatientRace().getValue()))
                .ethnicity(getEthnicityLiteral(row.getPatientEthnicity().getValue()))
                .tribalAffiliations(new ArrayList<>())
                .build());

    var testingLabOrg =
        fhirConverter.convertToOrganization(
            orgId.toString(),
            row.getTestingLabName().getValue(),
            row.getTestingLabClia().getValue(),
            row.getTestingLabPhoneNumber().getValue(),
            null,
            testingLabAddr,
            DEFAULT_COUNTRY);

    Organization orderingFacility = getOrderingFacilityOrgResource(row);

    var practitioner =
        fhirConverter.convertToPractitioner(
            row.getOrderingProviderId().getValue(),
            new PersonName(
                row.getOrderingProviderFirstName().getValue(),
                row.getOrderingProviderMiddleName().getValue(),
                row.getOrderingProviderLastName().getValue(),
                null),
            row.getOrderingProviderPhoneNumber().getValue(),
            providerAddr,
            DEFAULT_COUNTRY,
            row.getOrderingProviderId().getValue());

    String equipmentUid = null;
    String equipmentUidType = null;
    String testKitNameId = null;
    String manufacturer = null;
    String diseaseName = null;
    String testPerformedLoincLongName = null;
    String testOrderedLoincLongName = null;
    String testOrderedCode = row.getTestOrderedCode().getValue();

    UUID deviceId = uuidGenerator.randomUUID();
    var testPerformedCode = row.getTestPerformedCode().getValue();
    var modelName = row.getEquipmentModelName().getValue();
    var matchingDevice =
        resultsUploaderCachingService
            .getModelAndTestPerformedCodeToDeviceMap()
            .get(ResultsUploaderCachingService.getKey(modelName, testPerformedCode));

    if (matchingDevice != null) {
      List<DeviceTypeDisease> deviceTypeDiseaseEntries =
          matchingDevice.getSupportedDiseaseTestPerformed().stream()
              .filter(
                  disease -> Objects.equals(disease.getTestPerformedLoincCode(), testPerformedCode))
              .toList();
      manufacturer = matchingDevice.getManufacturer();
      equipmentUid =
          fhirConverter.getCommonDiseaseValue(
              deviceTypeDiseaseEntries, DeviceTypeDisease::getEquipmentUid);
      equipmentUidType =
          fhirConverter.getCommonDiseaseValue(
              deviceTypeDiseaseEntries, DeviceTypeDisease::getEquipmentUidType);
      testKitNameId =
          fhirConverter.getCommonDiseaseValue(
              deviceTypeDiseaseEntries, DeviceTypeDisease::getTestkitNameId);
      deviceId =
          deviceTypeDiseaseEntries.stream()
              .findFirst()
              .map(DeviceTypeDisease::getInternalId)
              .orElse(deviceId);
      testPerformedLoincLongName =
          deviceTypeDiseaseEntries.stream()
              .findFirst()
              .map(DeviceTypeDisease::getTestPerformedLoincLongName)
              .orElse(null);
      diseaseName =
          deviceTypeDiseaseEntries.stream()
              .findFirst()
              .map(DeviceTypeDisease::getSupportedDisease)
              .map(SupportedDisease::getName)
              .orElse(null);

      testOrderedCode =
          StringUtils.isEmpty(testOrderedCode)
              ? MultiplexUtils.inferMultiplexTestOrderLoinc(deviceTypeDiseaseEntries)
              : testOrderedCode;

      String finalTestOrderedCode = testOrderedCode;
      testOrderedLoincLongName =
          deviceTypeDiseaseEntries.stream()
              .filter(
                  deviceTypeDisease ->
                      Objects.equals(
                          deviceTypeDisease.getTestOrderedLoincCode(), finalTestOrderedCode))
              .findFirst()
              .map(DeviceTypeDisease::getTestOrderedLoincLongName)
              .orElse(null);
    } else {
      log.info(
          "No device found for model ("
              + Encode.forJava(modelName)
              + ") and test performed code ("
              + Encode.forJava(testPerformedCode)
              + ")");
    }

    if (diseaseName == null) {
      diseaseName = TestResultRow.diseaseSpecificLoincMap.get(testPerformedCode);
    }

    // code was not passed via api or inferred above: defaulting to the test performed code.
    testOrderedCode = StringUtils.isEmpty(testOrderedCode) ? testPerformedCode : testOrderedCode;

    var device =
        fhirConverter.convertToDevice(
            manufacturer, modelName, deviceId.toString(), equipmentUid, equipmentUidType);

    String specimenCode = getSpecimenTypeSnomed(row.getSpecimenType().getValue());
    String specimenName = getSpecimenTypeName(specimenCode);
    var specimen =
        fhirConverter.convertToSpecimen(
            ConvertToSpecimenProps.builder()
                .specimenCode(specimenCode)
                .specimenName(specimenName)
                .collectionCode(null)
                .collectionName(null)
                .id(uuidGenerator.randomUUID().toString())
                .identifier(uuidGenerator.randomUUID().toString())
                .collectionDate(specimenCollectionDate)
                .receivedTime(testingLabSpecimenReceivedDate)
                .build());

    SnomedConceptRecord resultConceptRecord =
        Translators.convertConceptCodeToConceptName(row.getTestResult().getValue());

    var resultObservation =
        List.of(
            fhirConverter.convertToObservation(
                ConvertToObservationProps.builder()
                    .testPerformedLoinc(row.getTestPerformedCode().getValue())
                    .diseaseName(diseaseName)
                    .resultCode(getTestResultSnomed(row.getTestResult().getValue()))
                    .correctionStatus(
                        mapTestResultStatusToSRValue(row.getTestResultStatus().getValue()))
                    .correctionReason(null)
                    .id(uuidGenerator.randomUUID().toString())
                    .resultDescription(
                        resultConceptRecord == null ? null : resultConceptRecord.name())
                    .testkitNameId(testKitNameId)
                    .deviceModel(row.getEquipmentModelName().getValue())
                    .issued(Date.from(testResultDate.toInstant()))
                    .testPerformedLOINCLongName(testPerformedLoincLongName)
                    .build()));

    var aoeObservations = new LinkedHashSet<Observation>();

    LocalDate symptomOnsetDate = null;
    if (StringUtils.isNotBlank(row.getIllnessOnsetDate().getValue())) {
      try {
        symptomOnsetDate =
            LocalDate.parse(row.getIllnessOnsetDate().getValue(), DATE_TIME_FORMATTER);
      } catch (DateTimeParseException e) {
        // empty values for optional fields come through as empty strings, not null
        log.error("Unable to parse date from CSV.");
      }
    }

    Boolean symptomatic = null;
    if (StringUtils.isNotBlank(row.getSymptomaticForDisease().getValue())) {
      symptomatic = yesNoToBooleanMap.get(row.getSymptomaticForDisease().getValue().toLowerCase());
    }

    aoeObservations.addAll(
        fhirConverter.convertToAOESymptomObservation(testEventId, symptomatic, symptomOnsetDate));

    String pregnancyValue = row.getPregnant().getValue();
    if (StringUtils.isNotBlank(pregnancyValue)) {
      String pregnancySnomed = getPregnancyStatusSnomed(pregnancyValue);
      aoeObservations.add(fhirConverter.convertToAOEPregnancyObservation(pregnancySnomed));
    }

    String employedInHealthcareValue = row.getEmployedInHealthcare().getValue();
    if (StringUtils.isNotBlank(employedInHealthcareValue)) {
      Boolean employedInHealthcare = yesNoToBooleanMap.get(employedInHealthcareValue.toLowerCase());
      aoeObservations.add(
          fhirConverter.convertToAOEYesNoUnkObservation(
              employedInHealthcare,
              LOINC_AOE_EMPLOYED_IN_HEALTHCARE,
              AOE_EMPLOYED_IN_HEALTHCARE_DISPLAY));
    }

    String hospitalizedValue = row.getHospitalized().getValue();
    if (StringUtils.isNotBlank(hospitalizedValue)) {
      Boolean hospitalized = yesNoToBooleanMap.get(hospitalizedValue.toLowerCase());
      aoeObservations.add(
          fhirConverter.convertToAOEYesNoUnkObservation(
              hospitalized, LOINC_AOE_HOSPITALIZED, "Hospitalized for condition"));
    }

    String icuValue = row.getIcu().getValue();
    if (StringUtils.isNotBlank(icuValue)) {
      Boolean hospitalized = yesNoToBooleanMap.get(icuValue.toLowerCase());
      aoeObservations.add(
          fhirConverter.convertToAOEYesNoUnkObservation(
              hospitalized, LOINC_AOE_ICU, "Admitted to ICU for condition"));
    }

    String residentCongregateSettingValue = row.getResidentCongregateSetting().getValue();
    if (StringUtils.isNotBlank(residentCongregateSettingValue)) {
      Boolean residesInCongregateSetting =
          yesNoToBooleanMap.get(residentCongregateSettingValue.toLowerCase());
      String residenceTypeValue = row.getResidenceType().getValue();
      String residenceTypeSnomed = null;
      if (StringUtils.isNotBlank(residenceTypeValue)) {
        residenceTypeSnomed = getResidenceTypeSnomed(residenceTypeValue);
      }
      aoeObservations.addAll(
          fhirConverter.convertToAOEResidenceObservation(
              residesInCongregateSetting, residenceTypeSnomed));
    }

    String gendersOfSexualPartnersValue = row.getGendersOfSexualPartners().getValue();
    if (StringUtils.isNotBlank(gendersOfSexualPartnersValue)) {
      Set<String> gendersOfSexualPartnersSet =
          extractSubstringsGenderOfSexualPartners(gendersOfSexualPartnersValue);
      Map<String, String> genderAbbreviationMap = getGenderIdentityAbbreviationMap();
      Set<String> abbrConvertedGenders =
          gendersOfSexualPartnersSet.stream()
              .distinct()
              .map(genderAbbreviationMap::get)
              .collect(Collectors.toSet());
      aoeObservations.addAll(
          fhirConverter.convertToAOEGenderOfSexualPartnersObservation(abbrConvertedGenders));
    }

    var serviceRequest =
        fhirConverter.convertToServiceRequest(
            ServiceRequest.ServiceRequestStatus.COMPLETED,
            testOrderedCode,
            uuidGenerator.randomUUID().toString(),
            orderTestDate,
            row.getComment().getValue());

    var diagnosticReport =
        fhirConverter.convertToDiagnosticReport(
            mapTestResultStatusToFhirValue(row.getTestResultStatus().getValue()),
            testPerformedCode,
            testOrderedLoincLongName,
            testEventId,
            testResultDate,
            dateResultReleased);

    return fhirConverter.createFhirBundle(
        CreateFhirBundleProps.builder()
            .patient(patient)
            .testingLab(testingLabOrg)
            .orderingFacility(orderingFacility)
            .practitioner(practitioner)
            .device(device)
            .specimen(specimen)
            .resultObservations(resultObservation)
            .aoeObservations(aoeObservations)
            .serviceRequest(serviceRequest)
            .diagnosticReport(diagnosticReport)
            .currentDate(dateGenerator.newDate())
            .gitProperties(gitProperties)
            .processingId(processingModeCode)
            .build());
  }

  private Bundle convertConditionAgnosticRowToFhirBundle(ConditionAgnosticResultRow row) {
    Patient patient =
        fhirConverter.convertToPatient(
            ConditionAgnosticConvertToPatientProps.builder()
                .id(row.getPatientId().getValue())
                .firstName(row.getPatientFirstName().getValue())
                .lastName(row.getPatientLastName().getValue())
                .nameAbsentReason(row.getPatientNameAbsentReason().getValue())
                .gender(row.getPatientAdminGender().getValue())
                .build());

    Observation observation =
        fhirConverter.convertToObservation(
            ConditionAgnosticConvertToObservationProps.builder()
                .correctionStatus(
                    mapTestResultStatusToSRValue(row.getTestResultStatus().getValue()))
                .resultValue(row.getTestResultValue().getValue())
                .patient(patient)
                .testPerformedCode(row.getTestPerformedCode().getValue())
                .build());

    DiagnosticReport diagnosticReport =
        fhirConverter.convertToDiagnosticReport(
            ConditionAgnosticConvertToDiagnosticReportProps.builder()
                .observation(observation)
                .patient(patient)
                .testEffectiveDate(row.getTestResultEffectiveDate().getValue())
                .testPerformedCode(row.getTestPerformedCode().getValue())
                .build());

    return fhirConverter.createFhirBundle(
        ConditionAgnosticCreateFhirBundleProps.builder()
            .patient(patient)
            .resultObservations(List.of(observation))
            .diagnosticReport(diagnosticReport)
            .gitProperties(gitProperties)
            .processingId(processingModeCode)
            .build());
  }

  private String getPregnancyStatusSnomed(String input) {
    if (input != null && input.matches(ALPHABET_REGEX)) {
      return PersonUtils.pregnancyStatusSnomedMap.get(input.toLowerCase());
    }
    return null;
  }

  private String getResidenceTypeSnomed(String input) {
    if (input != null && input.matches(ALPHABET_REGEX)) {
      return getResidenceTypeMap().get(input.toLowerCase());
    }
    return input;
  }

  private String getEthnicityLiteral(String input) {
    if (input != null && !input.matches(ALPHABET_REGEX)) {
      List<String> ethnicityList = PersonUtils.ETHNICITY_MAP.get(input);
      return ethnicityList != null ? ethnicityList.get(1) : input;
    }
    return input;
  }

  private String getRaceLiteral(String input) {
    if (input != null && !input.matches(ALPHABET_REGEX)) {
      return PersonUtils.raceMap.get(input);
    }
    return input;
  }

  private String getTestResultSnomed(String input) {
    if (input != null && input.matches(ALPHABET_REGEX)) {
      return testResultToSnomedMap.get(input.toLowerCase());
    }
    return input;
  }

  private String getSpecimenTypeSnomed(String input) {
    if (input != null && input.matches(ALPHABET_REGEX)) {
      return resultsUploaderCachingService
          .getSpecimenTypeNameToSNOMEDMap()
          .get(input.toLowerCase());
    } else if (input != null && input.matches(SNOMED_REGEX)) {
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
    if (input == null) {
      return DiagnosticReport.DiagnosticReportStatus.FINAL;
    }
    switch (input) {
      case "C":
        return DiagnosticReport.DiagnosticReportStatus.CORRECTED;
      case "F":
      default:
        return DiagnosticReport.DiagnosticReportStatus.FINAL;
    }
  }

  public Optional<String> getDiseaseFromDeviceSpecs(
      String equipmentModelName, String testPerformedCode) {

    var matchingDevice =
        resultsUploaderCachingService
            .getModelAndTestPerformedCodeToDeviceMap()
            .get(ResultsUploaderCachingService.getKey(equipmentModelName, testPerformedCode));

    if (matchingDevice != null) {
      List<DeviceTypeDisease> deviceTypeDiseaseEntries =
          matchingDevice.getSupportedDiseaseTestPerformed().stream()
              .filter(
                  disease -> Objects.equals(disease.getTestPerformedLoincCode(), testPerformedCode))
              .toList();

      if (!deviceTypeDiseaseEntries.isEmpty()) {
        return deviceTypeDiseaseEntries.stream()
            .findFirst()
            .map(DeviceTypeDisease::getSupportedDisease)
            .map(SupportedDisease::getName);
      }
    }

    return Optional.ofNullable(diseaseSpecificLoincMap.get(testPerformedCode));
  }

  private String getOrderingFacilityValOrDefault(
      String orderingFacilityVal, String testingLabDefaultVal) {
    return StringUtils.isNotEmpty(orderingFacilityVal) ? orderingFacilityVal : testingLabDefaultVal;
  }

  private Organization getOrderingFacilityOrgResource(TestResultRow row) {
    String orderingFacilityStreet =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityStreet().getValue(), row.getTestingLabStreet().getValue());
    String orderingFacilityStreet2 =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityStreet2().getValue(), row.getTestingLabStreet2().getValue());
    String orderingFacilityCity =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityCity().getValue(), row.getTestingLabCity().getValue());
    String orderingFacilityState =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityState().getValue(), row.getTestingLabState().getValue());
    String orderingFacilityZipCode =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityZipCode().getValue(), row.getTestingLabZipCode().getValue());

    StreetAddress orderingFacilityAddr =
        new StreetAddress(
            orderingFacilityStreet,
            orderingFacilityStreet2,
            orderingFacilityCity,
            orderingFacilityState,
            orderingFacilityZipCode,
            null);

    String orderingFacilityName =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityName().getValue(), row.getTestingLabName().getValue());
    String orderingFacilityPhoneNumber =
        getOrderingFacilityValOrDefault(
            row.getOrderingFacilityPhoneNumber().getValue(),
            row.getTestingLabPhoneNumber().getValue());

    return fhirConverter.convertToOrganization(
        uuidGenerator.randomUUID().toString(),
        orderingFacilityName,
        row.getTestingLabClia().getValue(),
        orderingFacilityPhoneNumber,
        null,
        orderingFacilityAddr,
        DEFAULT_COUNTRY);
  }
}
