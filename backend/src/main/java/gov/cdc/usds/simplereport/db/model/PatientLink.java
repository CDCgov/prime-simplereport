package gov.cdc.usds.simplereport.db.model;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class PatientLink extends EternalAuditedEntity {
  @OneToOne(optional = false)
  @JoinColumn(name = "test_order_id", nullable = false)
  private TestOrder testOrder;

  @Column private Date expiresAt;

  @OneToOne(mappedBy = "patientLink", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private PatientLinkFailedAttempt failedAttempts;

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

  public void refresh() {
    expiresAt = Date.from(Instant.now().plus(Duration.ofDays(1)));
  }

  public PatientLinkFailedAttempt getFailedAttempts() {
    return failedAttempts;
  }

  public void setFailedAttempts(PatientLinkFailedAttempt plfa) {
    failedAttempts = plfa;
  }
}
