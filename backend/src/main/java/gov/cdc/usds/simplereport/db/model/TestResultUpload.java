package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.Type;

@Getter
@Entity
@Slf4j
@Table(name = "upload")
public class TestResultUpload extends AuditedEntity {

  @Column private UUID reportId;

  @Column
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private UploadStatus status;

  @Column private int recordsCount;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "org_id")
  private Organization organization;

  @ManyToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id")
  private Facility facility;

  @Column private String warnings;

  @Column private String errors;

  protected TestResultUpload() {}

  public TestResultUpload(
      UUID reportId,
      UploadStatus status,
      int recordsCount,
      Organization organization,
      Facility facility,
      String warnings,
      String errors) {
    this.reportId = reportId;
    this.status = status;
    this.recordsCount = recordsCount;
    this.organization = organization;
    this.facility = facility;
    this.warnings = warnings;
    this.errors = errors;
  }

  public TestResultUpload(UploadStatus status) {
    this.status = status;
  }
}
