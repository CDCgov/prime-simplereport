package gov.cdc.usds.simplereport.db.model;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class PatientLink extends EternalAuditedEntity {
  public static final byte LOCKOUT_THRESHOLD = 5;

  @OneToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false)
  private TestOrder testOrder;

  @Column private Date expiresAt;

  @Column() private byte failedAttempts;

  public PatientLink() {}

  public PatientLink(TestOrder testOrder) {
    this.testOrder = testOrder;
  }

  public TestOrder getTestOrder() {
    return testOrder;
  }

  public Date getExpiresAt() {
    if (expiresAt == null) {
      return Date.from(getCreatedAt().toInstant().plus(Duration.ofDays(1)));
    }
    return expiresAt;
  }

  public boolean isExpired() {
    return Instant.now().isAfter(getExpiresAt().toInstant());
  }

  public void expire() {
    expiresAt = Date.from(Instant.now());
  }

  public boolean isLockedOut() {
    return failedAttempts >= LOCKOUT_THRESHOLD;
  }

  public void addFailedAttempt() {
    // do not overflow the byte
    if (failedAttempts < Byte.MAX_VALUE) {
      failedAttempts++;
    }
  }
}
