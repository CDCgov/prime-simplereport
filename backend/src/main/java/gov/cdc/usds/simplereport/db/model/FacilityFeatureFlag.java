package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class FacilityFeatureFlag extends AuditedEntity {
  @Column(nullable = false)
  private UUID facilityId;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Boolean value;
}
