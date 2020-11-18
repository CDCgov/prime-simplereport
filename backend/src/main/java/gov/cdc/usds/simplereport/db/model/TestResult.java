package gov.cdc.usds.simplereport.db.model;

import javax.persistence.*;
import java.time.LocalDate;

/**
 * Created by nickrobison on 11/17/20
 */
@Entity
@Table(name = "result")
public class TestResult extends EternalEntity {

    private String id;
    @ManyToOne(optional = false)
    private Person patient;
    @Column(nullable = false)
    private LocalDate dateTested;
    @ManyToOne(optional = false)
    private Device device;
    @Column(nullable = false)
    private String result;

    public TestResult() {
        // Hibernate required
    }

    // TODO: Remove this, only for mocks
    public TestResult(Device device, String result, Person patient) {
        this.patient = patient;
        this.dateTested = LocalDate.now();
        this.device = device;
        this.result = result;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Person getPatient() {
        return patient;
    }

    public void setPatient(Person patient) {
        this.patient = patient;
    }

    public LocalDate getDateTested() {
        return dateTested;
    }

    public void setDateTested(LocalDate dateTested) {
        this.dateTested = dateTested;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
