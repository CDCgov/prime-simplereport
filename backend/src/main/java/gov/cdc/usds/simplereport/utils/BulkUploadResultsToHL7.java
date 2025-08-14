package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.api.converter.HL7Constants.APHL_ORG_OID;
import static gov.cdc.usds.simplereport.api.converter.HL7Constants.SIMPLE_REPORT_ORG_OID;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.diseaseSpecificLoincMap;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7DateTime;
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
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

record HeaderSegmentFields(
    String fieldName,
    String sendingAppNamespaceId,
    String sendingAppUniversalId,
    String sendingAppUniversalIdType,
    String sendingFacilityNamespaceId,
    String sendingFacilityUniversalId,
    String sendingFacilityUniversalIdType,
    String receivingAppNamespaceId,
    String receivingAppUniversalId,
    String receivingAppUniversalIdType,
    String receivingFacilityNamespaceId,
    String receivingFacilityUniversalId,
    String receivingFacilityUniversalIdType,
    String datetime) {}

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
  private static final String ENCODING_CHARS = "^~\\&";

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  private static String orEmpty(String value) {
    return value == null ? "" : value;
  }

  private String generateHD(String namespaceId, String universalId, String universalIdType) {
    namespaceId = orEmpty(namespaceId);
    universalId = orEmpty(universalId);
    universalIdType = orEmpty(universalIdType);

    if (namespaceId.isEmpty() && universalId.isEmpty() && universalIdType.isEmpty()) {
      return "";
    }

    String result = namespaceId;

    if (!universalId.isEmpty() || !universalIdType.isEmpty()) {
      result += "^" + universalId;
    }

    if (!universalIdType.isEmpty()) {
      result += "^" + universalIdType;
    }

    return result;
  }

  private String generateHeaderSegment(HeaderSegmentFields fields) {
    var sendingApplication =
        generateHD(
            fields.sendingAppNamespaceId(),
            fields.sendingAppUniversalId(),
            fields.sendingAppUniversalIdType());

    var sendingFacility =
        generateHD(
            fields.sendingFacilityNamespaceId(),
            fields.sendingFacilityUniversalId(),
            fields.sendingFacilityUniversalIdType());

    var receivingApplication =
        generateHD(
            fields.receivingAppNamespaceId(),
            fields.receivingAppUniversalId(),
            fields.receivingAppUniversalIdType());

    var receivingFacility =
        generateHD(
            fields.receivingFacilityNamespaceId(),
            fields.receivingFacilityUniversalId(),
            fields.receivingFacilityUniversalIdType());

    return String.join(
        "|",
        fields.fieldName(),
        ENCODING_CHARS,
        sendingApplication,
        sendingFacility,
        receivingApplication,
        receivingFacility,
        fields.datetime());
  }

  private String generateTrailingSegment(String fieldName, int itemCount) {
    return String.join("|", fieldName, String.valueOf(itemCount));
  }

  public HL7BatchMessage convertToHL7BatchMessage(InputStream csvStream) {
    String batchMessage = "";
    int batchMessageCount = 0;
    HashMap<String, Integer> diseasesReported = new HashMap<>();
    var futureTestEvents = new ArrayList<CompletableFuture<String>>();
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    String sendingFacilityNamespaceId = null;
    String sendingFacilityUniversalId = null;

    while (valueIterator.hasNext()) {
      final Map<String, String> row = getNextRow(valueIterator);
      TestResultRow fileRow = new TestResultRow(row);

      if (sendingFacilityNamespaceId == null) {
        sendingFacilityNamespaceId = fileRow.getTestingLabName().getValue();
      }

      if (sendingFacilityUniversalId == null) {
        sendingFacilityUniversalId = fileRow.getTestingLabClia().getValue();
      }

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
                  // TODO: address exception gracefully
                  return "";
                }
              });

      futureTestEvents.add(future);
      batchMessageCount += 1;
    }

    String messages =
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
            .collect(Collectors.joining("\n"));

    try {
      ArrayList<String> parts = new ArrayList<>();

      // FHS
      parts.add(
          generateHeaderSegment(
              new HeaderSegmentFields(
                  "FHS",
                  "SimpleReport",
                  SIMPLE_REPORT_ORG_OID,
                  "ISO",
                  sendingFacilityNamespaceId,
                  sendingFacilityUniversalId,
                  "CLIA",
                  "APHL",
                  APHL_ORG_OID,
                  "ISO",
                  "APHL",
                  APHL_ORG_OID,
                  "ISO",
                  formatToHL7DateTime(dateGenerator.newDate()))));

      // BHS
      parts.add(
          generateHeaderSegment(
              new HeaderSegmentFields(
                  "BHS",
                  "SimpleReport",
                  SIMPLE_REPORT_ORG_OID,
                  "ISO",
                  sendingFacilityNamespaceId,
                  sendingFacilityUniversalId,
                  "CLIA",
                  "APHL",
                  APHL_ORG_OID,
                  "ISO",
                  "APHL",
                  APHL_ORG_OID,
                  "ISO",
                  formatToHL7DateTime(dateGenerator.newDate()))));

      // Append test result messages
      parts.add(messages);

      // BTS
      parts.add(generateTrailingSegment("BTS", batchMessageCount));

      // FTS
      parts.add(generateTrailingSegment("FTS", 1));

      batchMessage = String.join("\n", parts);
    } catch (Exception e) {
      log.error("Encountered an error converting CSV to Batch HL7 Message");
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

    try {
      var labReportMessage =
          hl7Converter.createLabReportMessage(
              patientInput,
              providerInput,
              performingFacility,
              orderingFacility,
              specimenInput,
              testDetailsInputList,
              gitProperties,
              processingModeCode,
              testId);

      return parser.encode(labReportMessage);
    } catch (HL7Exception e) {
      log.error("Encountered an error converting CSV row to HL7");
      throw e;
    }
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

  private FacilityReportInput getPerformingFacilityInput(TestResultRow row) {
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

  private FacilityReportInput getOrderingFacilityInput(TestResultRow row) {
    return FacilityReportInput.builder()
        .name(row.getOrderingFacilityName().getValue())
        .street(row.getOrderingFacilityStreet().getValue())
        .streetTwo(row.getOrderingFacilityStreet2().getValue())
        .city(row.getOrderingFacilityCity().getValue())
        .state(row.getOrderingFacilityState().getValue())
        .zipCode(row.getOrderingFacilityZipCode().getValue())
        .phone(row.getOrderingFacilityPhoneNumber().getValue())
        .build();
  }

  private SpecimenInput getSpecimenInput(TestResultRow row) {
    return SpecimenInput.builder()
        .snomedTypeCode(row.getSpecimenType().getValue())
        .snomedDisplay(null)
        .collectionDate(
            Date.from(
                LocalDate.parse(row.getSpecimenCollectionDate().getValue(), DATE_TIME_FORMATTER)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant()))
        .receivedDate(
            Date.from(
                LocalDate.parse(
                        row.getTestingLabSpecimenReceivedDate().getValue(), DATE_TIME_FORMATTER)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant()))
        .build();
  }

  private TestDetailsInput getTestDetailsInput(TestResultRow row) {
    return TestDetailsInput.builder()
        .testOrderLoinc(row.getTestOrderedCode().getValue())
        .testPerformedLoinc(row.getTestPerformedCode().getValue())
        .resultType(ResultScaleType.ORDINAL)
        .resultValue(row.getTestResult().getValue())
        .resultDate(
            Date.from(
                LocalDate.parse(row.getTestResultDate().getValue(), DATE_TIME_FORMATTER)
                    .atStartOfDay(ZoneId.systemDefault())
                    .toInstant()))
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
}
