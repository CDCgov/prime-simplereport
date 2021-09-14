package gov.cdc.usds.simplereport.api.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class TestMetrics {
  private int positiveTests;
  private int totalTests;
}
