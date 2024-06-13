package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity(name = "api_user_facility")
public class ApiUserFacility extends AuditedEntity {

  @ManyToOne
  @JoinColumn(name = "api_user_id", nullable = false)
  @Setter
  private ApiUser apiUser;

  @ManyToOne
  @JoinColumn(name = "facility_id", nullable = false)
  @Setter
  @Getter
  private Facility facility;
}
