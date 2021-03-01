package gov.cdc.usds.simplereport.db.model;

import java.util.Date;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

import org.springframework.data.annotation.CreatedDate;

@Entity
public class TimeOfConsent {

    @Column(updatable = false, nullable = false)
    @Id
    @GeneratedValue(generator = "UUID4")
    private UUID internalId;

    @Column(updatable = false)
    @CreatedDate
    private Date createdAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "patient_link_id", nullable = false)
    private PatientLink patientLink;

    public TimeOfConsent() {
    }

    public TimeOfConsent(PatientLink patientLink) {
        this.patientLink = patientLink;
    }

    public UUID getInternalId() {
        return internalId;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public PatientLink getPatientLink() {
        return patientLink;
    }
}
