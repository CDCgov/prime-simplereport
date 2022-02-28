package gov.cdc.usds.simplereport.db.model;

import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NaturalId;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
public class Result extends EternalAuditedEntity {

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "test_event_id", nullable = false, updatable = false)
  private TestEvent testEvent;

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false, updatable = false)
  private TestOrder testOrder;

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "disease_id", nullable = false, updatable = false)
  private SupportedDisease disease;

  @Column(nullable = false)
  private String result;

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
        && Objects.equals(result, that.result);
  }

  @Override
  public int hashCode() {
    return Objects.hash(testEvent, testOrder, disease, result);
  }
}
