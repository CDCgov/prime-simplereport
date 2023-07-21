package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.Table;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "result_upload_error")
public class ResultUploadError extends AuditedEntity {
  @Column private UUID uploadId;
  @Column private UUID orgId;
  @Column private UUID submissionId;

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

  public ResultUploadError(
      Organization organization, FeedbackMessage feedbackMessage, UUID submissionId) {
    this.orgId = organization.getInternalId();
    this.submissionId = submissionId;
    this.type = feedbackMessage.getErrorType();
    this.source = feedbackMessage.getSource();
    this.field = feedbackMessage.getFieldHeader();
    this.required = feedbackMessage.isFieldRequired();
    this.message = feedbackMessage.getMessage();
  }

  public ResultUploadError(
      TestResultUpload upload,
      Organization organization,
      FeedbackMessage feedbackMessage,
      UUID submissionId) {
    this(organization, feedbackMessage, submissionId);
    this.uploadId = (upload != null) ? upload.getInternalId() : null;
  }
}
