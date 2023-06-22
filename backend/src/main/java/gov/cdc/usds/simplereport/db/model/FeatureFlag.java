package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
public class FeatureFlag extends AuditedEntity {
  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Boolean value;
}
