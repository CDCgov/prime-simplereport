package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimen;

public class DeviceTypeHolder {

    private DeviceSpecimen _defaultDeviceType;
    private List<DeviceSpecimen> _allDeviceTypes;

    public DeviceTypeHolder(DeviceSpecimen defaultType, List<DeviceSpecimen> configuredTypes) {
		super();
		this._defaultDeviceType = defaultType;
		this._allDeviceTypes = Collections.unmodifiableList(configuredTypes);
	}

    public DeviceSpecimen getDefaultDeviceType() {
		return _defaultDeviceType;
	}

    public List<DeviceSpecimen> getConfiguredDeviceTypes() {
		return _allDeviceTypes;
	}
}
