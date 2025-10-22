package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.SupportedDiseaseTestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
@Builder
public class Result extends EternalAuditedEntity {

  @ManyToOne
  @JoinColumn(name = "test_event_id")
  @Setter
  private TestEvent testEvent;

  @ManyToOne
  @JoinColumn(name = "test_order_id")
  @Setter
  private TestOrder testOrder;

  @ManyToOne(optional = false)
  @JoinColumn(name = "disease_id", nullable = false, updatable = false)
  private SupportedDisease disease;

  @Column(name = "result", nullable = false)
  private String resultSNOMED;

  @Column(name = "test_result", nullable = false, columnDefinition = "TEST_RESULT")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  private TestResult testResult;

  @JsonIgnore @Column private Boolean piiDeleted;

  public Result(SupportedDisease disease, TestResult testResult) {
    this.disease = disease;
    this.resultSNOMED = Translators.convertTestResultToSnomed(testResult);
    this.testResult = testResult;
  }

  /* Copy constructor, used for corrections and removals */
  public Result(Result originalResult) {
    this.disease = originalResult.disease;
    this.resultSNOMED = originalResult.resultSNOMED;
    this.testResult = originalResult.testResult;
  }

  public SupportedDiseaseTestResult getDiseaseResult() {
    return new SupportedDiseaseTestResult(this.disease, this.testResult);
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
        && Objects.equals(resultSNOMED, that.resultSNOMED)
        && Objects.equals(testResult, that.testResult);
  }

  @Override
  public int hashCode() {
    return Objects.hash(testEvent, testOrder, disease, resultSNOMED, testResult);
  }
}
