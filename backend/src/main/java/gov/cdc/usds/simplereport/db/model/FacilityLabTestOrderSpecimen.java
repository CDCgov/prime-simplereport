package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityLabTestOrderSpecimen extends AuditedEntity {
  @Column(nullable = false)
  @NonNull
  private UUID facilityLabTestOrderId;

  @Column(nullable = false)
  @NonNull
  private UUID specimenId;
}
