package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Lab extends EternalAuditedEntity {

  @Column(nullable = false)
  private String code;

  @Column(nullable = false)
  private String display;

  @Column
  private String description;

  @Column (nullable = false)
  private String longCommonName;

  @Column
  private String scaleCode;

  @Column
  private String scaleDisplay;

  @Column
  private String systemCode;

  @Column
  private String systemDisplay;

  @Column
  private String answerList;

  @Column(nullable = false)
  private String orderOrObservation;

  @Column(nullable = false)
  private Boolean panel;


  public Lab(String code, String display, String description, String longCommonName, String scaleCode, String scaleDisplay, String systemCode, String systemDisplay, String answerList, String orderOrObservation, Boolean panel) {
    super();
    this.code = code;
    this.display = display;
    this.description = description;
    this.longCommonName = longCommonName;
    this.scaleCode = scaleCode;
    this.scaleDisplay = scaleDisplay;
    this.systemCode = systemCode;
    this.systemDisplay = systemDisplay;
    this.answerList = answerList;
    this.orderOrObservation = orderOrObservation;
    this.panel = panel;
  }

  protected Lab() {
    /* for hibernate */
  }
}
