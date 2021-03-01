package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import java.util.Collections;
import java.util.List;

public class DeviceSpecimenTypeHolder {

  private DeviceSpecimenType _default;
  private List<DeviceSpecimenType> _all;

  public DeviceSpecimenTypeHolder(
      DeviceSpecimenType defaultType, List<DeviceSpecimenType> configuredTypes) {
    super();
    this._default = defaultType;
    this._all = Collections.unmodifiableList(configuredTypes);
  }

  public DeviceSpecimenType getDefault() {
    return _default;
  }

  public List<DeviceSpecimenType> getFullList() {
    return _all;
  }
}
