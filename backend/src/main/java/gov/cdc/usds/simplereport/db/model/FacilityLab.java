package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityLab extends EternalAuditedEntity {
  @Column(nullable = false)
  @NonNull
  private UUID facilityId;

  @Column(nullable = false)
  @NonNull
  private UUID labId;

  @Column(nullable = false)
  @NonNull
  private String name;

  @Column(nullable = false)
  @NonNull
  private String description;

  @Getter
  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "facility_lab_specimen",
      joinColumns = @JoinColumn(name = "facility_lab_id"),
      inverseJoinColumns = @JoinColumn(name = "specimen_id"))
  private Set<Specimen> specimens = new HashSet<>();

  public void addSpecimen(Specimen specimen) {
    this.specimens.add(specimen);
  }

  public boolean removeSpecimen(Specimen specimen) {
    return this.specimens.remove(specimen);
  }
}
