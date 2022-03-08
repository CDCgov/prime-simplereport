package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
public class Result extends EternalAuditedEntity {

  @ManyToOne(optional = false)
  @JoinColumn(name = "test_event_id", nullable = false, updatable = false)
  private TestEvent testEvent;

  @ManyToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false, updatable = false)
  private TestOrder testOrder;

  @ManyToOne(optional = false)
  @JoinColumn(name = "disease_id", nullable = false, updatable = false)
  private SupportedDisease disease;

  // Stored as LOINC
  @Column(nullable = false)
  private String result;

  public Result(TestEvent te, TestOrder to, SupportedDisease disease, TestResult testResult) {
    this.testEvent = te;
    this.testOrder = to;
    this.disease = disease;
    this.result = Translators.convertTestResultToLoinc(testResult);
  }

  public TestResult getTestResult() {
    return Translators.convertLoincToResult(this.result);
  }

  public String getRawTestResult() {
    return this.result;
  }

  public void setTestResult(TestResult result) {
    this.result = Translators.convertTestResultToLoinc(result);
  }

  public void setRawTestResult(String result) {
    this.result = result;
  }
}
