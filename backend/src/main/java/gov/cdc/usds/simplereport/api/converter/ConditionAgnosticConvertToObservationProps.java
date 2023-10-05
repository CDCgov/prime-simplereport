package gov.cdc.usds.simplereport.api.converter;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import lombok.Builder;
import lombok.Getter;
import org.hl7.fhir.r4.model.Patient;

@Builder
@Getter
public class ConditionAgnosticConvertToObservationProps {
  private TestCorrectionStatus correctionStatus;
  private String testPerformedCode;
  private Patient patient;
  private String resultValue;
}
