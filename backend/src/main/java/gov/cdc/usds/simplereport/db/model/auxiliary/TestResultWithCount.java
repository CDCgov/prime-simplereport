package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;

/** The results from a group by when getting dashboard metrics */
@AllArgsConstructor
@Getter
public class TestResultWithCount {
  private TestResult result;
  private Long count;
}
