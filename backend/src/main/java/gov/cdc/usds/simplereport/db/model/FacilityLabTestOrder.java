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
public class FacilityLabTestOrder extends EternalAuditedEntity {
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

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "facility_lab_test_order_specimen",
      joinColumns = @JoinColumn(name = "facility_lab_test_order_id"),
      inverseJoinColumns = @JoinColumn(name = "specimen_id"))
  private Set<Specimen> configuredSpecimens = new HashSet<>();

  public Set<Specimen> getSpecimens() {
    return this.configuredSpecimens;
  }

  public boolean addSpecimen(Specimen specimen) {
    if (this.configuredSpecimens.contains(specimen)) {
      return false;
    }

    return this.configuredSpecimens.add(specimen);
  }

  public boolean removeSpecimen(Specimen specimen) {
    return this.configuredSpecimens.remove(specimen);
  }
}
