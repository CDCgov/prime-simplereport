package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
public class Result extends EternalAuditedEntity {

  @ManyToOne
  @JoinColumn(name = "test_event_id")
  private TestEvent testEvent;

  @ManyToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false, updatable = false)
  private TestOrder testOrder;

  @ManyToOne(optional = false)
  @JoinColumn(name = "disease_id", nullable = false, updatable = false)
  private SupportedDisease disease;

  @Column(name = "result", nullable = false)
  private String resultLOINC;

  @Column(name = "test_result", nullable = false)
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestResult testResult;

  public Result(
      TestEvent testEvent, TestOrder testOrder, SupportedDisease disease, TestResult testResult) {
    this.testEvent = testEvent;
    this.testOrder = testOrder;
    this.disease = disease;
    this.resultLOINC = Translators.convertTestResultToLoinc(testResult);
    this.testResult = testResult;
  }

  public Result(TestOrder testOrder, SupportedDisease disease, TestResult testResult) {
    // question - should this also update order?
    // order.setResult = this? Or is it better to include that in the service/in the TestOrder?
    this.testOrder = testOrder;
    this.disease = disease;
    this.resultLOINC = Translators.convertTestResultToLoinc(testResult);
    this.testResult = testResult;
  }

  public void setTestEvent(TestEvent event) {
    this.testEvent = event;
  }

  public void setResult(TestResult testResult) {
    this.resultLOINC = Translators.convertTestResultToLoinc(testResult);
    this.testResult = testResult;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Result that = (Result) o;
    return Objects.equals(testEvent, that.testEvent)
        && Objects.equals(testOrder, that.testOrder)
        && Objects.equals(disease, that.disease)
        && Objects.equals(resultLOINC, that.resultLOINC)
        && Objects.equals(testResult, that.testResult);
  }

  @Override
  public int hashCode() {
    return Objects.hash(testEvent, testOrder, disease, resultLOINC, testResult);
  }
}
