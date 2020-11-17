package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;

public class Device {
	private String id;
	private String displayName;
	private String deviceManufacturer;
	private String deviceModel;
	private boolean isDefault;

	public Device(String displayName, String deviceManufacturer, String deviceModel,
			boolean isDefault) {
		super();
		this.id = UUID.randomUUID().toString();
		this.displayName = displayName;
		this.deviceManufacturer = deviceManufacturer;
		this.deviceModel = deviceModel;
		this.isDefault = isDefault;
	}
	public String getId() {
		return id;
	}
	public String getDisplayName() {
		return displayName;
	}
	public String getDeviceManufacturer() {
		return deviceManufacturer;
	}
	public String getDeviceModel() {
		return deviceModel;
	}
	public boolean isDefault() {
		return isDefault;
	}
}
