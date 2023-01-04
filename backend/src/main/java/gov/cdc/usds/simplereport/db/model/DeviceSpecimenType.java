package gov.cdc.usds.simplereport.db.model;

import java.util.Objects;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.NaturalId;

/**
 * A valid combination of device and specimen types. Can be soft-deleted, but cannot be otherwise
 * modified.
 */
@Entity
public class DeviceSpecimenType extends EternalAuditedEntity {

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "device_type_id", nullable = false, updatable = false)
  private DeviceType deviceType;

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "specimen_type_id", nullable = false, updatable = false)
  private SpecimenType specimenType;

  protected DeviceSpecimenType() {} // for hibernate

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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DeviceSpecimenType that = (DeviceSpecimenType) o;
    return Objects.equals(deviceType, that.deviceType)
        && Objects.equals(specimenType, that.specimenType);
  }

  @Override
  public int hashCode() {
    return Objects.hash(deviceType, specimenType);
  }
}
