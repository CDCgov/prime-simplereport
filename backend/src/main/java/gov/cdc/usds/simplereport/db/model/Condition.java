package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
public class Condition extends EternalAuditedEntity {

  @Getter
  @Column(nullable = false)
  private String code;

  @Getter
  @Column(nullable = false)
  private String display;

  @Column private boolean hasLabs;

  public boolean getHasLabs() {
    return hasLabs;
  }

  @JoinTable(
      name = "condition_lab_join",
      joinColumns = @JoinColumn(name = "condition_id"),
      inverseJoinColumns = @JoinColumn(name = "lab_id"))
  @ManyToMany(fetch = FetchType.LAZY)
  @Getter
  private Set<Lab> labs = new HashSet<>();

  public Condition(String code, String display) {
    super();
    this.code = code;
    this.display = display;
  }

  protected Condition() {
    /* for hibernate */
  }
}
