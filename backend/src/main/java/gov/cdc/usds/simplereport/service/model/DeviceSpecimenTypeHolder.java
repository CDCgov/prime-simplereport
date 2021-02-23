package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;

public class DeviceSpecimenTypeHolder {

    private DeviceSpecimenType _defaultDeviceType;
    private List<DeviceSpecimenType> _allDeviceTypes;

    public DeviceSpecimenTypeHolder(DeviceSpecimenType defaultType, List<DeviceSpecimenType> configuredTypes) {
        super();
        this._defaultDeviceType = defaultType;
        this._allDeviceTypes = Collections.unmodifiableList(configuredTypes);
    }

    public DeviceSpecimenType getDefaultDeviceSpecimenType() {
        return _defaultDeviceType;
    }

    public List<DeviceSpecimenType> getConfiguredDeviceSpecimenTypes() {
        return _allDeviceTypes;
    }
}
