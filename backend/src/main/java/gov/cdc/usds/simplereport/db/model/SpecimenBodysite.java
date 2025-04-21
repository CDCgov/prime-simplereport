package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
public class SpecimenBodysite extends AuditedEntity {

  @Getter
  @Column(nullable = false)
  private String snomedSpecimenCode;

  @Getter
  @Column(nullable = false)
  private String snomedSpecimenDisplay;

  @Getter
  @Column(nullable = false)
  private String snomedSiteCode;

  @Getter
  @Column(nullable = false)
  private String snomedSiteDisplay;

  public SpecimenBodysite(
      String snomedSpecimenCode,
      String snomedSpecimenDisplay,
      String snomedSiteCode,
      String snomedSiteDisplay) {
    super();
    this.snomedSpecimenCode = snomedSpecimenCode;
    this.snomedSpecimenDisplay = snomedSpecimenDisplay;
    this.snomedSiteCode = snomedSiteCode;
    this.snomedSiteDisplay = snomedSiteDisplay;
  }

  protected SpecimenBodysite() {
    /* for hibernate */
  }
}
