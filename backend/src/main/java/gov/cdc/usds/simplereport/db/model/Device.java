package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

/**
 * Created by nickrobison on 11/17/20
 */
@Entity
public class Device extends EternalEntity {

    private String displayName;
    @Column(nullable = false)
    private String deviceManufacturer;
    @Column(nullable = false)
    private String deviceModel;
    @OneToOne
    @JoinColumn(name = "organization_id")
    Organization organization;

    public Device() {
        // Hibernate required
    }

    public Device(String displayName, String deviceManufacturer, String deviceModel) {
        this.displayName = displayName;
        this.deviceManufacturer = deviceManufacturer;
        this.deviceModel = deviceModel;
        this.organization = null;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDeviceManufacturer() {
        return deviceManufacturer;
    }

    public void setDeviceManufacturer(String deviceManufacturer) {
        this.deviceManufacturer = deviceManufacturer;
    }

    public String getDeviceModel() {
        return deviceModel;
    }

    public void setDeviceModel(String deviceModel) {
        this.deviceModel = deviceModel;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    String id() {
        return "Not an ID";
    }
}
