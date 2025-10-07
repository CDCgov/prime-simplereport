package gov.cdc.usds.simplereport.db.model;

import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.MapsId;
import javax.persistence.OneToOne;

@Entity
public class PatientLinkFailedAttempt {
  public static final byte LOCKOUT_THRESHOLD = 10;

  @Id private UUID patientLinkInternalId;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  private PatientLink patientLink;

  @Column private byte failedAttempts;

  public PatientLinkFailedAttempt() {}

  public PatientLinkFailedAttempt(PatientLink pl) {
    patientLink = pl;
    failedAttempts = 0;
  }

  public PatientLink getPatientLink() {
    return patientLink;
  }

  public void setPatientLink(PatientLink patientLink) {
    this.patientLink = patientLink;
  }

  public byte getFailedAttempts() {
    return failedAttempts;
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

  public void resetFailedAttempts() {
    this.failedAttempts = 0;
  }
}
