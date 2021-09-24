package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.util.Objects;
import java.util.UUID;

public class DeviceSpecimenTypeInput {
  UUID deviceType;
  UUID specimenType;

  public DeviceSpecimenTypeInput() {}

  public DeviceSpecimenTypeInput(UUID deviceType, UUID specimenType) {
    this.deviceType = deviceType;
    this.specimenType = specimenType;
  }

  public UUID getDeviceType() {
    return deviceType;
  }

  public UUID getSpecimenType() {
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
    DeviceSpecimenTypeInput that = (DeviceSpecimenTypeInput) o;
    return Objects.equals(deviceType, that.deviceType)
        && Objects.equals(specimenType, that.specimenType);
  }

  @Override
  public int hashCode() {
    return Objects.hash(deviceType, specimenType);
  }
}
