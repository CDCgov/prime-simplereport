package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.util.UUID;

public class TestResult {

  private String id;
  private LocalDate dateTested;

  public TestResult(LocalDate dateTested) {
    super();
		this.id = UUID.randomUUID().toString();
    this.dateTested = dateTested;
  }

  public LocalDate getId() {
    return dateTested;
  }

  public LocalDate getDateTested() {
    return dateTested;
  }
}
