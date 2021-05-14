package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

@Entity
public class PatientRegistrationLink extends EternalAuditedEntity {
  @OneToOne(optional = true)
  @JoinColumn(name = "facility_id")
  private Facility facility;

  @OneToOne(optional = true)
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Column(nullable = false)
  private String patientRegistrationLink;

  public PatientRegistrationLink() {}

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
    if (facility != null) {
      return facility.getOrganization();
    }
    return organization;
  }

  public String getLink() {
    return patientRegistrationLink;
  }

  public void setLink(String link) {
    this.patientRegistrationLink = link;
  }
}
