package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.INVALID_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NEGATIVE_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOT_DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.POSITIVE_SNOMED;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.diseaseSpecificLoincMap;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7DateTime;
import static gov.cdc.usds.simplereport.utils.ResultUtils.mapTestResultStatusToSRValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.SNOMED_REGEX;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.parser.Parser;
import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.converter.HL7Converter;
import gov.cdc.usds.simplereport.api.converter.HapiContextProvider;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ResultScaleType;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import java.io.InputStream;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class BulkUploadResultsToHL7 {
  private final HL7Converter hl7Converter;
  private final GitProperties gitProperties;
  private final HapiContext hapiContext = HapiContextProvider.get();
  private final Parser parser = hapiContext.getPipeParser();
  private final DateGenerator dateGenerator;
  private final ResultsUploaderCachingService resultsUploaderCachingService;
  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";

  private final Map<String, String> testResultToSnomedMap =
      Map.of(
          "Positive".toLowerCase(), POSITIVE_SNOMED,
          "Negative".toLowerCase(), NEGATIVE_SNOMED,
          "Detected".toLowerCase(), DETECTED_SNOMED,
          "Not Detected".toLowerCase(), NOT_DETECTED_SNOMED,
          "Invalid Result".toLowerCase(), INVALID_SNOMED);

  @Value("${simple-report.aims-processing-mode-code:T}")
  private String aimsProcessingModeCode = "T";

  public HL7BatchMessage convertToHL7BatchMessage(InputStream csvStream) {
    String batchMessage = "";
    int batchMessageCount = 0;
    HashMap<String, Integer> diseasesReported = new HashMap<>();
    var futureTestEvents = new ArrayList<CompletableFuture<String>>();
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    // The dates in FHS and BHS must be earlier or equal to date in MSH
    String batchDate = formatToHL7DateTime(dateGenerator.newDate());

    while (valueIterator.hasNext()) {
      final Map<String, String> row = getNextRow(valueIterator);
      TestResultRow fileRow = new TestResultRow(row);

      Optional<String> disease =
          getDiseaseFromDeviceSpecs(
              fileRow.getEquipmentModelName().getValue(),
              fileRow.getTestPerformedCode().getValue());

      if (disease.isPresent()) {
        diseasesReported.put(disease.get(), diseasesReported.getOrDefault(disease.get(), 0) + 1);
      }

      var future =
          CompletableFuture.supplyAsync(
              () -> {
                try {
                  return convertRowToHL7(fileRow);
                } catch (HL7Exception e) {
                  throw new CompletionException(e);
                }
              });

      futureTestEvents.add(future);
      batchMessageCount += 1;
    }

    List<String> messages =
        futureTestEvents.stream()
            .map(
                future -> {
                  try {
                    return future.get();
                  } catch (InterruptedException | ExecutionException | CompletionException e) {
                    log.error("Bulk upload failure to convert to HL7.", e);
                    Thread.currentThread().interrupt();
                    throw new CsvProcessingException("Unable to process file.");
                  }
                })
            .toList();

    try {
      batchMessage = hl7Converter.createBatchFileString(messages, batchMessageCount, batchDate);
    } catch (NullPointerException e) {
      log.error("Encountered an error converting CSV to Batch HL7 Message");
      throw new CsvProcessingException("Unable to generate HL7 Segments");
    }

    return new HL7BatchMessage(batchMessage, batchMessageCount, diseasesReported);
  }

  private String convertRowToHL7(TestResultRow row) throws HL7Exception {
    var testId = row.getAccessionNumber().getValue();

    var patientInput = getPatientInput(row);
    var providerInput = getProviderInput(row);
    var performingFacility = getPerformingFacilityInput(row);
    var orderingFacility = getOrderingFacilityInput(row);
    var specimenInput = getSpecimenInput(row);
    var testDetailsInputList = List.of(getTestDetailsInput(row));
    var testStatus = mapTestResultStatusToSRValue(row.getTestResultStatus().getValue());

    var labReportMessage =
        hl7Converter.createLabReportMessage(
            patientInput,
            providerInput,
            performingFacility,
            orderingFacility,
            specimenInput,
            testDetailsInputList,
            gitProperties,
            aimsProcessingModeCode,
            testId,
            testStatus,
            true);

    return parser.encode(labReportMessage);
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
        .patientExternalId(row.getPatientId().getValue())
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

  private FacilityReportInput getPerformingFacilityInput(TestResultRow row) {
    return FacilityReportInput.builder()
        .name(row.getTestingLabName().getValue())
        .clia(row.getTestingLabClia().getValue())
        .street(row.getTestingLabStreet().getValue())
        .streetTwo(row.getTestingLabStreet2().getValue())
        .city(row.getTestingLabCity().getValue())
        .state(row.getTestingLabState().getValue())
        .zipCode(row.getTestingLabZipCode().getValue())
        .phone(
            StringUtils.defaultIfEmpty(
                row.getTestingLabPhoneNumber().getValue(),
                row.getOrderingProviderPhoneNumber().getValue()))
        .build();
  }

  /**
   * Uses legacy logic from sending FHIR for populating empty ordering facility fields with testing
   * lab fields. This isn't ideal, so we'll need to decide on a more thorough approach in the
   * future.
   */
  private FacilityReportInput getOrderingFacilityInput(TestResultRow row) {
    String orderingFacilityStreet =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityStreet().getValue(), row.getTestingLabStreet().getValue());

    String orderingFacilityStreet2 =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityStreet2().getValue(), row.getTestingLabStreet2().getValue());

    String orderingFacilityCity =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityCity().getValue(), row.getTestingLabCity().getValue());

    String orderingFacilityState =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityState().getValue(), row.getTestingLabState().getValue());

    String orderingFacilityZipCode =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityZipCode().getValue(), row.getTestingLabZipCode().getValue());

    String orderingFacilityName =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityName().getValue(), row.getTestingLabName().getValue());

    String orderingFacilityPhoneNumber =
        StringUtils.defaultIfEmpty(
            row.getOrderingFacilityPhoneNumber().getValue(),
            StringUtils.defaultIfEmpty(
                row.getTestingLabPhoneNumber().getValue(),
                row.getOrderingProviderPhoneNumber().getValue()));

    return FacilityReportInput.builder()
        .name(orderingFacilityName)
        .clia(row.getTestingLabClia().getValue())
        .street(orderingFacilityStreet)
        .streetTwo(orderingFacilityStreet2)
        .city(orderingFacilityCity)
        .state(orderingFacilityState)
        .zipCode(orderingFacilityZipCode)
        .phone(orderingFacilityPhoneNumber)
        .build();
  }

  private SpecimenInput getSpecimenInput(TestResultRow row) {
    var specimenType = StringUtils.defaultIfEmpty(row.getSpecimenType().getValue(), "");
    var specimenCode = getSpecimenTypeSnomed(specimenType);

    var providerAddr = getProviderAddress(row);
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

    return SpecimenInput.builder()
        .snomedTypeCode(specimenCode)
        .snomedDisplay(getSpecimenTypeName(specimenCode))
        .collectionDate(Date.from(specimenCollectionDate.toInstant()))
        .receivedDate(Date.from(testingLabSpecimenReceivedDate.toInstant()))
        .build();
  }

  private TestDetailsInput getTestDetailsInput(TestResultRow row) {
    var testPerformedCode = row.getTestPerformedCode().getValue();
    var modelName = row.getEquipmentModelName().getValue();
    var testOrderedCode = row.getTestOrderedCode().getValue();
    var testOrderedLoincLongName = "";
    var resultValue =
        StringUtils.defaultIfEmpty(getTestResultSnomed(row.getTestResult().getValue()), "");

    var matchingDevice =
        resultsUploaderCachingService
            .getModelAndTestPerformedCodeToDeviceMap()
            .get(ResultsUploaderCachingService.getKey(modelName, testPerformedCode));

    var providerAddr = getProviderAddress(row);

    var testResultDate =
        convertToZonedDateTime(
            row.getTestResultDate().getValue(), resultsUploaderCachingService, providerAddr);

    if (matchingDevice != null) {
      Set<DeviceTypeDisease> deviceTypeDiseaseEntries =
          matchingDevice.getSupportedDiseaseTestPerformed().stream()
              .filter(
                  disease -> Objects.equals(disease.getTestPerformedLoincCode(), testPerformedCode))
              .collect(Collectors.toSet());

      testOrderedCode =
          StringUtils.isEmpty(testOrderedCode)
              ? MultiplexUtils.inferMultiplexDeviceTypeDisease(
                      deviceTypeDiseaseEntries, matchingDevice, true)
                  .getTestOrderedLoincCode()
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
    }

    testOrderedCode = StringUtils.defaultIfEmpty(testOrderedCode, testPerformedCode);

    return TestDetailsInput.builder()
        .testOrderLoinc(testOrderedCode)
        .testOrderDisplayName(testOrderedLoincLongName)
        .testPerformedLoinc(testPerformedCode)
        .resultType(ResultScaleType.ORDINAL)
        .resultValue(resultValue)
        .resultDate(Date.from(testResultDate.toInstant()))
        .build();
  }

  private Optional<String> getDiseaseFromDeviceSpecs(
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

    return "";
  }

  private String getSpecimenTypeName(String specimenSNOMED) {
    if (specimenSNOMED != null) {
      return resultsUploaderCachingService.getSNOMEDToSpecimenTypeNameMap().get(specimenSNOMED);
    }

    return null;
  }

  private StreetAddress getProviderAddress(TestResultRow row) {
    return new StreetAddress(
        row.getOrderingProviderStreet().getValue(),
        row.getOrderingProviderStreet2().getValue(),
        row.getOrderingProviderCity().getValue(),
        row.getOrderingProviderState().getValue(),
        row.getOrderingProviderZipCode().getValue(),
        null);
  }
}
