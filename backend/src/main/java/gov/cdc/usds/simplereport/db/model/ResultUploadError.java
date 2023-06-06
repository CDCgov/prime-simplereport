package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Type;

@Getter
@Setter
@Entity
@Slf4j
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

  /*
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;
   */

  @Column()
  @Type(type = "text")
  private String field;

  @Column()
  @Type(type = "boolean")
  private boolean required;

  @Column()
  @Type(type = "text")
  private String message;

  protected ResultUploadError() {}

  public ResultUploadError(
      TestResultUpload upload,
      Organization organization,
      ResultUploadErrorType type,
      String field,
      boolean required,
      String message) {
    this.upload = upload;
    this.organization = organization;
    this.type = type;
    this.field = field;
    this.required = required;
    this.message = message;
  }
}
