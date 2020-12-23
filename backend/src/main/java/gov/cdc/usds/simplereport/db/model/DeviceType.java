package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;

import org.springframework.boot.context.properties.ConstructorBinding;

/**
 * The durable (and non-deletable) representation of a POC test device model.
 */
@Entity
public class DeviceType extends EternalEntity {

    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String loincCode;
    @Column(nullable = false)
    private String manufacturer;
    @Column(nullable = false)
    private String model;

    protected DeviceType() { /* no-op for hibernate */ }

    @ConstructorBinding
    public DeviceType(String name, String manufacturer, String model, String loincCode) {
        super();
        this.name = name;
        this.manufacturer = manufacturer;
        this.model = model;
        this.loincCode = loincCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getLoincCode() {
        return loincCode;
    }

    public void setLoincCode(String loincCode) {
        this.loincCode = loincCode;
    }
}
