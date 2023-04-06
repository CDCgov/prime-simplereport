package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
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
