package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Condition extends EternalAuditedEntity {

  @Column(nullable = false)
  private String code;

  @Column(nullable = false)
  private String display;

  public Condition(String code, String display) {
    super();
    this.code = code;
    this.display = display;
  }

  protected Condition() {
    /* for hibernate */
  }
}
