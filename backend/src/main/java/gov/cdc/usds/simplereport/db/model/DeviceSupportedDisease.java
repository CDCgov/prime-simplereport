package gov.cdc.usds.simplereport.db.model;

import java.util.Objects;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NaturalId;

/** A combination of devices and the diseases they test for. */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Entity
public class DeviceSupportedDisease extends EternalAuditedEntity {

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "device_type_id", nullable = false, updatable = false)
  private DeviceType deviceType;

  @NaturalId
  @ManyToOne(optional = false)
  @JoinColumn(name = "supported_disease_id", nullable = false, updatable = false)
  private SupportedDisease supportedDisease;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DeviceSupportedDisease that = (DeviceSupportedDisease) o;
    return Objects.equals(deviceType, that.deviceType)
        && Objects.equals(supportedDisease, that.supportedDisease);
  }

  @Override
  public int hashCode() {
    return Objects.hash(deviceType, supportedDisease);
  }
}
