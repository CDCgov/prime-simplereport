package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class TimeOfConsent extends EternalAuditedEntity {

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_link_id", nullable = false)
    private PatientLink patientLink;

    public TimeOfConsent() {
    }

    public TimeOfConsent(PatientLink patientLink) {
        this.patientLink = patientLink;
    }

    public PatientLink getPatientLink() {
        return patientLink;
    }
}
