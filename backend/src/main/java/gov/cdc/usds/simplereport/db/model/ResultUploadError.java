package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "result_upload_error")
public class ResultUploadError extends AuditedEntity {
  @Column private UUID uploadId;
  @Column private UUID orgId;
  @Column private UUID submissionId;

  @Column(columnDefinition = "TEST_RESULT_UPLOAD_ERROR")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  private ResultUploadErrorType type;

  @Column private String field;

  @Column(columnDefinition = "RESULT_UPLOAD_ERROR_SOURCE")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  private ResultUploadErrorSource source;

  @Column private boolean required;

  @Column private String message;

  @Column @Getter private Boolean piiDeleted;

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
