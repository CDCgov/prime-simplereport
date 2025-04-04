package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Setter
public class Specimen extends EternalAuditedEntity {

  @Getter
  @Column(nullable = false)
  private String loincSystemCode;

  @Getter
  @Column(nullable = false)
  private String loincSystemDisplay;

  @Getter
  @Column(nullable = false)
  private String snomedCode;

  @Getter
  @Column(nullable = false)
  private String snomedDisplay;


  public Specimen(String loincSystemCode, String loincSystemDisplay, String snomedCode, String snomedDisplay) {
    super();
    this.loincSystemCode = loincSystemCode;
    this.loincSystemDisplay = loincSystemDisplay;
    this.snomedCode = snomedCode;
    this.snomedDisplay = snomedDisplay;
  }

  protected Specimen() {
    /* for hibernate */
  }
}
