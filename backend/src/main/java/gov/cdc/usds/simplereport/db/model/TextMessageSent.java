package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class TextMessageSent extends EternalAuditedEntity {
  @ManyToOne
  @JoinColumn(name = "patient_link_internal_id")
  private PatientLink patientLink;
  
  @Column private String twilioMessageId;

  public TextMessageSent(PatientLink link, String messageId) {
    patientLink = link;
    twilioMessageId = messageId;
  }
}
