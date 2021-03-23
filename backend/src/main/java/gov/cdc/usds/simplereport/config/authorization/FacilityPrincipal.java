package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.Facility;
import java.security.Principal;
import java.util.Objects;

public final class FacilityPrincipal implements Principal {
  private final Facility facility;

  public FacilityPrincipal(Facility facility) {
    this.facility = Objects.requireNonNull(facility);
  }

  @Override
  public String getName() {
    return facility.getFacilityName();
  }

  public Facility getFacility() {
    return facility;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    FacilityPrincipal that = (FacilityPrincipal) o;
    return facility.equals(that.facility);
  }

  @Override
  public int hashCode() {
    return Objects.hash(facility);
  }
}
