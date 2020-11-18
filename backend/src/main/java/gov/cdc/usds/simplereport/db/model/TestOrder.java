package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

/**
 * Created by nickrobison on 11/17/20
 */
@Entity
public class TestOrder extends EternalEntity {

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Person patient;
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private Organization organization;
    private String orderStatus;
    private String result;

    public TestOrder() {
        // Hibernate required
    }

    public Person getPatient() {
        return patient;
    }

    public void setPatient(Person patient) {
        this.patient = patient;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }
}
