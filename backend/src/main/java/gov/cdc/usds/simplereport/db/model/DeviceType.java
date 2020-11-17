package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;

/**
 * The durable (and non-deletable) representation of a POC test device model.
 */
@Entity
public class DeviceType extends EternalEntity {

	public DeviceType(String name, String manufacturer, String model) {
		super();
		this.name = name;
		this.manufacturer = manufacturer;
		this.model = model;
	}

	@Column(nullable = false)
	private String name;
	@Column(nullable = false)
	private String manufacturer;
	@Column(nullable = false)
	private String model;

	protected DeviceType() { /* no-op for hibernate */ }

	public String getName() {
		return name;
	}

	public String getManufacturer() {
		return manufacturer;
	}

	public String getModel() {
		return model;
	}
}
