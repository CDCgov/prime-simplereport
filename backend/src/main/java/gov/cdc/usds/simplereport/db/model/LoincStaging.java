package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class LoincStaging extends IdentifiedEntity {

  @Column(nullable = false)
  private String code;

  @Column(nullable = false)
  private String display;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "condition_id")
  private Condition condition;

  public LoincStaging(String code, String display, Condition condition) {
    super();
    this.code = code;
    this.display = display;
    this.condition = condition;
  }

  protected LoincStaging() {
    /* for hibernate */
  }
}
