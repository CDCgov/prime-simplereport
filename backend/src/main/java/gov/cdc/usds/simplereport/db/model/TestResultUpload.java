package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import io.hypersistence.utils.hibernate.type.basic.PostgreSQLEnumType;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Type;

@Getter
@Setter
@Entity
@Slf4j
@Table(name = "upload")
public class TestResultUpload extends AuditedEntity {

  @Column private UUID reportId;
  @Column private UUID submissionId;

  @Column(columnDefinition = "UPLOAD_STATUS")
  @Type(PostgreSQLEnumType.class)
  @Enumerated(EnumType.STRING)
  private UploadStatus status;

  @Column private int recordsCount;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "org_id")
  @JsonIgnore
  private Organization organization;

  @Column()
  @Type(JsonBinaryType.class)
  private FeedbackMessage[] warnings;

  @Column()
  @Type(JsonBinaryType.class)
  private FeedbackMessage[] errors;

  protected TestResultUpload() {}

  public TestResultUpload(
      UUID reportId,
      UUID submissionId,
      UploadStatus status,
      int recordsCount,
      Organization organization,
      FeedbackMessage[] warnings,
      FeedbackMessage[] errors) {
    this.reportId = reportId;
    this.submissionId = submissionId;
    this.status = status;
    this.recordsCount = recordsCount;
    this.organization = organization;
    this.warnings = warnings;
    this.errors = errors;
  }

  public TestResultUpload(UploadStatus status) {
    this.status = status;
  }
}
