package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "result_upload_error")
public class ResultUploadError extends AuditedEntity {
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "upload_id")
  private TestResultUpload upload;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "org_id")
  private Organization organization;

  @Column
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private ResultUploadErrorType type;

  @Column
  @Type(type = "text")
  private String field;

  @Column
  @Type(type = "pg_enum")
  private ResultUploadErrorSource source;

  @Column
  @Type(type = "boolean")
  private boolean required;

  @Column
  @Type(type = "text")
  private String message;

  protected ResultUploadError() {}

  public ResultUploadError(Organization organization, FeedbackMessage feedbackMessage) {
    this.organization = organization;
    this.type = feedbackMessage.getErrorType();
    this.source = feedbackMessage.getSource();
    this.field = feedbackMessage.getFieldHeader();
    this.required = feedbackMessage.isFieldRequired();
    this.message = feedbackMessage.getMessage();
  }

  public ResultUploadError(
      TestResultUpload upload, Organization organization, FeedbackMessage feedbackMessage) {
    this.upload = upload;
    this.organization = organization;
    this.type = feedbackMessage.getErrorType();
    this.source = feedbackMessage.getSource();
    this.field = feedbackMessage.getFieldHeader();
    this.required = feedbackMessage.isFieldRequired();
    this.message = feedbackMessage.getMessage();
  }
}
