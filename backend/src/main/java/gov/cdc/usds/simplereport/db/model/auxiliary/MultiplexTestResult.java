package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class MultiplexTestResult {
  private String diseaseName;
  private TestResult testResult;
}
