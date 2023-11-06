package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
public class UploadDiseaseDetails extends AuditedEntity {

  @ManyToOne
  @JoinColumn(name = "supported_disease_id", nullable = false)
  private SupportedDisease disease;

  @ManyToOne
  @JoinColumn(name = "upload_id", nullable = false)
  private TestResultUpload upload;

  @Column(nullable = false)
  private int recordsCount;
}
