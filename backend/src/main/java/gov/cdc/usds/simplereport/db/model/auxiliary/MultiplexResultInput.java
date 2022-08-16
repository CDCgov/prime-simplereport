package gov.cdc.usds.simplereport.db.model.auxiliary;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class MultiplexResultInput {
  private String diseaseName; // TODO-G Change to disease??
  private TestResult testResult;
}
