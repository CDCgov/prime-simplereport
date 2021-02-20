package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.NaturalId;

/**
 * A valid combination of device and specimen types. Can be soft-deleted, but
 * cannot be otherwise modified.
 */
@Entity
@Table(name = "device_specimen")
public class DeviceSpecimenType extends EternalAuditedEntity {

    @NaturalId
    @ManyToOne(optional = false)
    @JoinColumn(name = "device_type_id", nullable = false, updatable = false)
    private DeviceType deviceType;

    @NaturalId
    @ManyToOne(optional = false)
    @JoinColumn(name = "specimen_type_id", nullable = false, updatable = false)
    private SpecimenType specimenType;

    protected DeviceSpecimenType() {
    } // for hibernate

    public DeviceSpecimenType(DeviceType deviceType, SpecimenType specimenType) {
        this.deviceType = deviceType;
        this.specimenType = specimenType;
    }

    public DeviceType getDeviceType() {
        return deviceType;
    }

    public SpecimenType getSpecimenType() {
        return specimenType;
    }
}
