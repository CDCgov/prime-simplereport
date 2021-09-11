package gov.cdc.usds.simplereport.db.model;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class PatientLink extends EternalAuditedEntity {
  private static final int SHELF_LIFE_DAYS = 3;

  @ManyToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false)
  private TestOrder testOrder;

  @Column private Date expiresAt;

  public PatientLink() {}

  public PatientLink(TestOrder testOrder) {
    this.testOrder = testOrder;
  }

  public TestOrder getTestOrder() {
    return testOrder;
  }

  public UUID getTestOrderId() {
    return testOrder.getInternalId();
  }

  public Date getExpiresAt() {
    if (expiresAt == null) {
      return Date.from(getCreatedAt().toInstant().plus(Duration.ofDays(SHELF_LIFE_DAYS)));
    }
    return expiresAt;
  }

  public boolean isExpired() {
    return Instant.now().isAfter(getExpiresAt().toInstant());
  }

  public void expire() {
    expiresAt = Date.from(Instant.now());
  }

  public void refresh() {
    expiresAt = Date.from(Instant.now().plus(Duration.ofDays(SHELF_LIFE_DAYS)));
  }
}
