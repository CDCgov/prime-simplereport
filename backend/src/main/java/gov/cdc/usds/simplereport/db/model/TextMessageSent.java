package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class TextMessageSent extends AuditedEntity {
  @ManyToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_link_internal_id")
  private PatientLink patientLink;

  @Column private String twilioMessageId;

  public TextMessageSent() {}

  public TextMessageSent(PatientLink link, String messageId) {
    patientLink = link;
    twilioMessageId = messageId;
  }

  public PatientLink getPatientLink() {
    return patientLink;
  }

  public String getTwilioMessageId() {
    return twilioMessageId;
  }
}
