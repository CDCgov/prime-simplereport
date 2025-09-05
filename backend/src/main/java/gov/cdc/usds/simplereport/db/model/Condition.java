package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@EqualsAndHashCode(
    of = {"code"},
    callSuper = false)
public class Condition extends EternalAuditedEntity {

  @Getter
  @Column(nullable = false)
  private String code;

  /** This value comes from APHL's Terminology Exchange Service */
  @Getter
  @Column(nullable = false)
  private String display;

  /** This value comes from the UMLS Terminology Service endpoint for a SNOMED */
  @Getter @Column private String snomedName;

  @Column private boolean hasLabs;

  public boolean getHasLabs() {
    return hasLabs;
  }

  @JoinTable(
      name = "condition_lab_join",
      joinColumns = @JoinColumn(name = "condition_id"),
      inverseJoinColumns = @JoinColumn(name = "lab_id"))
  @ManyToMany(
      fetch = FetchType.LAZY,
      cascade = {CascadeType.PERSIST, CascadeType.MERGE})
  @Getter
  private Set<Lab> labs = new HashSet<>();

  public Condition(String code, String display, String snomedName) {
    super();
    this.code = code;
    this.display = display;
    this.snomedName = snomedName;
  }

  protected Condition() {
    /* for hibernate */
  }
}
