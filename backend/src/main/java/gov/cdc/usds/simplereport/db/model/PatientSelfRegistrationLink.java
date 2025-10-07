package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

@Entity
@Table(name = "patient_registration_link")
public class PatientSelfRegistrationLink extends EternalAuditedEntity {
  @OneToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id")
  private Facility facility;

  @OneToOne(optional = true, fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id")
  private Organization organization;

  @Column(nullable = false)
  private String patientRegistrationLink;

  public PatientSelfRegistrationLink() {}

  public PatientSelfRegistrationLink(Organization org, String link) {
    this.organization = org;
    this.patientRegistrationLink = link;
  }

  public PatientSelfRegistrationLink(Facility fac, String link) {
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
