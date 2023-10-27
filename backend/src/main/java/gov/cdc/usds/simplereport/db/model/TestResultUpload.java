package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Type;

@Getter
@Setter
@Entity
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "upload")
public class TestResultUpload extends AuditedEntity {

  @Column private UUID reportId;
  @Column private UUID submissionId;

  @Column
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private UploadStatus status;

  @Column private int recordsCount;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "org_id")
  @JsonIgnore
  private Organization organization;

  @Column()
  @Type(type = "jsonb")
  private FeedbackMessage[] warnings;

  @Column()
  @Type(type = "jsonb")
  private FeedbackMessage[] errors;

  @Column()
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private Pipeline destination;

  @ManyToOne
  @JoinColumn(name = "supported_disease_id", updatable = false)
  private SupportedDisease disease;

  public TestResultUpload(UploadStatus status) {
    this.status = status;
  }
}
