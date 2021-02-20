package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;

public class DeviceTypeHolder {

    private DeviceSpecimenType _defaultDeviceType;
    private List<DeviceSpecimenType> _allDeviceTypes;

    public DeviceTypeHolder(DeviceSpecimenType defaultType, List<DeviceSpecimenType> configuredTypes) {
		super();
		this._defaultDeviceType = defaultType;
		this._allDeviceTypes = Collections.unmodifiableList(configuredTypes);
	}

    public DeviceSpecimenType getDefaultDeviceType() {
		return _defaultDeviceType;
	}

    public List<DeviceSpecimenType> getConfiguredDeviceTypes() {
		return _allDeviceTypes;
	}
}
