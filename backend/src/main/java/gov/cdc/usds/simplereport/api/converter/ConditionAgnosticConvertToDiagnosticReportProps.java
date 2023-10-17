package gov.cdc.usds.simplereport.api.converter;

import lombok.Builder;
import lombok.Getter;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Patient;

@Builder
@Getter
public class ConditionAgnosticConvertToDiagnosticReportProps {
  private String testPerformedCode;
  private Patient patient;
  private Observation observation;
  private String testEffectiveDate;
}
