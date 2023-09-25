package gov.cdc.usds.simplereport.api.converter;

import lombok.Builder;
import lombok.Getter;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Patient;

@Builder
@Getter
public class ConditionAgnosticCreateFhirBundleProps {
  private Patient patient;
  private Observation observation;
  private DiagnosticReport diagnosticReport;
}
