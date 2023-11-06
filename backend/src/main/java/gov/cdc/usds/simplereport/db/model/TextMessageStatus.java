package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class TextMessageStatus extends AuditedEntity {
  @ManyToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "text_message_sent_internal_id")
  private TextMessageSent textMessageSent;

  @Column private String status;

  public TextMessageStatus() {}

  public TextMessageStatus(TextMessageSent textMessageSent, String status) {
    this.textMessageSent = textMessageSent;
    this.status = status;
  }

  public String getStatus() {
    return status;
  }
}
