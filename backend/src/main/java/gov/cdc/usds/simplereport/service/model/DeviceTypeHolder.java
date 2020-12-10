package gov.cdc.usds.simplereport.service.model;

import java.util.Collections;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceType;

public class DeviceTypeHolder {

	private DeviceType _defaultDeviceType;
	private List<DeviceType> _allDeviceTypes;
	public DeviceTypeHolder(DeviceType defaultType, List<DeviceType> configuredTypes) {
		super();
		this._defaultDeviceType = defaultType;
		this._allDeviceTypes = Collections.unmodifiableList(configuredTypes);
	}

	public DeviceType getDefaultDeviceType() {
		return _defaultDeviceType;
	}

	public List<DeviceType> getConfiguredDeviceTypes() {
		return _allDeviceTypes;
	}
}
