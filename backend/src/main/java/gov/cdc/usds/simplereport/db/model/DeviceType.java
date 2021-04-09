package gov.cdc.usds.simplereport.db.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import org.springframework.boot.context.properties.ConstructorBinding;

/** The durable (and non-deletable) representation of a POC test device model. */
@Entity
public class DeviceType extends EternalAuditedEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String loincCode;

  @Column(nullable = false)
  private String manufacturer;

  @Column(nullable = false)
  private String model;

  @Column(nullable = false)
  private String swabType;

  private Integer testLength;

  protected DeviceType() {
    /* no-op for hibernate */
  }

  @ConstructorBinding
  public DeviceType(
      String name, String manufacturer, String model, String loincCode, String swabType) {
    super();
    this.name = name;
    this.manufacturer = manufacturer;
    this.model = model;
    this.loincCode = loincCode;
    this.swabType = swabType;
    this.testLength = determineTestLength(name);
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

  public String getSwabType() {
    return swabType;
  }

  public void setSwabType(String swabType) {
    this.swabType = swabType;
  }

  public Integer getTestLength() {
    if (testLength != null) {
      return testLength;
    } else {
      this.testLength = determineTestLength(name);
      return testLength;
    }
  }

  public void setTestLength(Integer testLength) {
    this.testLength = testLength;
  }

  private Integer determineTestLength(String name) {
    if (name.contains("CareStart")) {
      return 10;
    } else {
      return 15;
    }
  }
}
