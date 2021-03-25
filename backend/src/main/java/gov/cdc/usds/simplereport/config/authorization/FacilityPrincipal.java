package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.Facility;
import java.util.Objects;

/** A principal that represents the facility affiliation of a SimpleReport user. */
public final class FacilityPrincipal extends NamedPrincipal {
  private final Facility facility;

  public FacilityPrincipal(Facility facility) {
    super("FACILITY:" + facility.getFacilityName());
    this.facility = facility;
  }

  public Facility getFacility() {
    return facility;
  }

  @Override
  public boolean equals(Object o) {
    return this == o
        || (o instanceof FacilityPrincipal && facility.equals(((FacilityPrincipal) o).facility));
  }

  @Override
  public int hashCode() {
    return Objects.hash(facility);
  }
}
