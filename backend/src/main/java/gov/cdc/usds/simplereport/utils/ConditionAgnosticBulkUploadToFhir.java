package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.ResultUtils.mapTestResultStatusToSRValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.converter.*;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Patient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ConditionAgnosticBulkUploadToFhir {
  private final ConditionAgnosticFhirConverter fhirConverter;
  private final GitProperties gitProperties;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCode = "P";

  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();

  public List<String> convertToFhirBundles(InputStream csvStream, Organization org) {
    //      QUESTION: it wasn't explicitly in the spec but should we be adding org-related info into
    // the FHIR bundle?

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
          CompletableFuture.supplyAsync(() -> convertRowToFhirBundle(fileRow))
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

    return bundles;
  }

  private Bundle convertRowToFhirBundle(ConditionAgnosticResultRow row) {
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

    var bundle =
        fhirConverter.createFhirBundle(
            ConditionAgnosticCreateFhirBundleProps.builder()
                .patient(patient)
                .resultObservations(List.of(observation))
                .diagnosticReport(diagnosticReport)
                .gitProperties(gitProperties)
                .processingId(processingModeCode)
                .build());

    // Indent the output
    parser.setPrettyPrint(true);

    // Serialize it
    String serialized = parser.encodeResourceToString(bundle);
    log.warn("RESULT FROM FHIR CONVERTER: " + serialized);

    return bundle;
  }
}
