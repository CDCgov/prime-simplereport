package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import ca.uhn.hl7v2.HL7Exception;
import ca.uhn.hl7v2.HapiContext;
import ca.uhn.hl7v2.model.v251.segment.BHS;
import ca.uhn.hl7v2.model.v251.segment.BTS;
import ca.uhn.hl7v2.model.v251.segment.FHS;
import ca.uhn.hl7v2.model.v251.segment.FTS;
import ca.uhn.hl7v2.parser.EncodingCharacters;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.info.GitProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class BulkUploadResultsToHL7 {
  private final HL7Converter hl7Converter;
  private final GitProperties gitProperties;
  private final HapiContext hapiContext = HapiContextProvider.get();
  private final Parser parser = hapiContext.getPipeParser();

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  public String convertToHL7BatchMessage(InputStream csvStream) {
    String batchMessage = "";
    HashMap<String, Integer> diseasesReported = new HashMap<>();
    var futureTestEvents = new ArrayList<CompletableFuture<String>>();
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    while (valueIterator.hasNext()) {
      final Map<String, String> row = getNextRow(valueIterator);
      TestResultRow fileRow = new TestResultRow(row);

      var future = CompletableFuture.supplyAsync(() -> {
        try {
          return convertRowToHL7(fileRow);
        } catch (HL7Exception e) {
          // TODO: address exception gracefully
          return "";
        }
      });

      futureTestEvents.add(future);
    }

    String messages = futureTestEvents.stream()
        .map(future -> {
            try {
                return future.get();
            } catch (InterruptedException | ExecutionException e) {
              log.error("Bulk upload failure to convert to fhir.", e);
              Thread.currentThread().interrupt();
              throw new CsvProcessingException("Unable to process file.");
            }
        })
        .collect(Collectors.joining());

    batchMessage += messages;

//    var fhs = new FHS(null, null);
//    var bhs = new BHS(null, null);
//    var bts = new BTS(null, null);
//    var fts = new FTS(null, null);
//
//    try {
//      batchMessage += parser.doEncode(fhs, EncodingCharacters.defaultInstance());
//      batchMessage += parser.doEncode(bhs, EncodingCharacters.defaultInstance());
//      batchMessage += parser.doEncode(bts, EncodingCharacters.defaultInstance());
//      batchMessage += parser.doEncode(fts, EncodingCharacters.defaultInstance());
//    } catch (HL7Exception e) {
//      log.error("Encountered an error converting CSV to Batch HL7 Message");
//    }

    return batchMessage;
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
      var labReportMessage = hl7Converter.createLabReportMessage(
        patientInput,
        providerInput,
        performingFacility,
        orderingFacility,
        specimenInput,
        testDetailsInputList,
        gitProperties,
        processingModeCode,
        testId
      );

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
                LocalDate.parse(row.getTestingLabSpecimenReceivedDate().getValue(), DATE_TIME_FORMATTER)
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
}
