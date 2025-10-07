package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

@Entity
@Slf4j
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Setter
@Getter
@Table(name = "upload")
public class TestResultUpload extends AuditedEntity {

  @Column private UUID reportId;
  @Column private UUID submissionId;

  @Column(columnDefinition = "UPLOAD_STATUS")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
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

  @Column(columnDefinition = "PIPELINE")
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Enumerated(EnumType.STRING)
  private Pipeline destination;

  @OneToMany(mappedBy = "upload")
  List<UploadDiseaseDetails> uploadDiseaseDetails;

  @Column private Boolean piiDeleted;

  public TestResultUpload(UploadStatus status) {
    this.status = status;
  }
}
