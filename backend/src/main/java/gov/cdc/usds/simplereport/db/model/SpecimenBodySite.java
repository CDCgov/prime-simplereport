package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Builder
public class SpecimenBodySite extends AuditedEntity {

  @Column(nullable = false)
  private String snomedSpecimenCode;

  @Column(nullable = false)
  private String snomedSpecimenDisplay;

  @Column(nullable = false)
  private String snomedSiteCode;

  @Column(nullable = false)
  private String snomedSiteDisplay;
}
