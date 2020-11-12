package gov.cdc.usds.simplereport.api.model;

public class Device {
	private String deviceId;
	private String displayName;
	private String deviceManufacturer;
	private String deviceModel;
	private boolean isDefault;

	public Device(String deviceId, String displayName, String deviceManufacturer, String deviceModel,
			boolean isDefault) {
		super();
		this.deviceId = deviceId;
		this.displayName = displayName;
		this.deviceManufacturer = deviceManufacturer;
		this.deviceModel = deviceModel;
		this.isDefault = isDefault;
	}
	public String getDeviceId() {
		return deviceId;
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
