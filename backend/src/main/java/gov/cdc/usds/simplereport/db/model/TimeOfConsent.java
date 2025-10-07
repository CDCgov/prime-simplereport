package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@DynamicUpdate
public class TimeOfConsent extends SystemManagedEntity {

  @ManyToOne(optional = false)
  @JoinColumn(name = "patient_link_id", nullable = false)
  private PatientLink patientLink;

  public TimeOfConsent() {}

  public TimeOfConsent(PatientLink patientLink) {
    this.patientLink = patientLink;
  }

  public PatientLink getPatientLink() {
    return patientLink;
  }
}
