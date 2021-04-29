package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class PatientRegistrationLink extends EternalAuditedEntity {
  @OneToOne
  @JoinColumn(name = "facility_id", nullable = true)
  private Facility facility;

  @OneToOne
  @JoinColumn(name = "organization_id", nullable = true)
  private Organization organization;

  String patientRegistrationLink;

  public PatientRegistrationLink(Organization org, String link) {
    this.organization = org;
    this.patientRegistrationLink = link;
  }

  public PatientRegistrationLink(Facility fac, String link) {
    this.facility = fac;
    this.patientRegistrationLink = link;
  }

  public Facility getFacility() {
    return facility;
  }

  public Organization getOrganization() {
    return organization;
  }
}
