package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.DiseaseResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
public class Result extends EternalAuditedEntity {

  @ManyToOne(optional = false)
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

  public Result(TestOrder to, DiseaseResult dr) {
    this.testOrder = to;
    this.disease = dr.getDisease();
    this.resultLOINC = Translators.convertTestResultToLoinc(dr.getResult());
  }

  public Result(TestOrder to, TestEvent te, DiseaseResult dr) {
    this.testOrder = to;
    this.testEvent = te;
    this.disease = dr.getDisease();
    this.resultLOINC = Translators.convertTestResultToLoinc(dr.getResult());
  }

  public Result(
      TestEvent testEvent, TestOrder testOrder, SupportedDisease disease, TestResult testResult) {
    this.testEvent = testEvent;
    this.testOrder = testOrder;
    this.disease = disease;
    this.resultLOINC = Translators.convertTestResultToLoinc(testResult);
  }

  public void setTestEvent(TestEvent te) {
    this.testEvent = te;
  }

  public TestResult getTestResult() {
    return Translators.convertLoincToResult(this.resultLOINC);
  }

  public void setTestResult(TestResult result) {
    this.resultLOINC = Translators.convertTestResultToLoinc(result);
    this.testResult = testResult;
  }
}
