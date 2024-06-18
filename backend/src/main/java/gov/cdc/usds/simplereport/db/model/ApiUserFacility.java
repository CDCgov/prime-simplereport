package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;

@Entity(name = "api_user_facility")
public class ApiUserFacility extends AuditedEntity {

  @ManyToOne
  @JoinColumn(name = "api_user_id", nullable = false)
  private ApiUser apiUser;

  @ManyToOne
  @JoinColumn(name = "facility_id", nullable = false)
  @Getter
  private Facility facility;

  protected ApiUserFacility() {
    /* for hibernate */
  }

  public ApiUserFacility(ApiUser user, Facility facility) {
    this.apiUser = user;
    this.facility = facility;
  }
}
