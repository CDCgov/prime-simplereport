package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class MultiplexTestResult {
  private TestResult covid19;
  private TestResult fluA;
  private TestResult fluB;
}
