package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class SupportedDiseaseTestResult {
  private SupportedDisease disease;
  private TestResult testResult;
}
