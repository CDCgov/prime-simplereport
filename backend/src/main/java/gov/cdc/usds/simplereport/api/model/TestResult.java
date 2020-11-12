package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

public class TestResult {

  private LocalDate dateTested;

  public TestResult(LocalDate dateTested) {
    super();
    this.dateTested = dateTested;
  }

  public LocalDate getDateTested() {
    return dateTested;
  }
}
