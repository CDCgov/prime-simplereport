package gov.cdc.usds.simplereport.db.model;

import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import lombok.Getter;
import org.springframework.boot.context.properties.ConstructorBinding;

/** The durable (and non-deletable) representation of a POC test device model. */
@Entity
@Getter
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

  @JoinTable(
      name = "device_specimen_type",
      joinColumns = @JoinColumn(name = "device_type_id"),
      inverseJoinColumns = @JoinColumn(name = "specimen_type_id"))
  @OneToMany(fetch = FetchType.LAZY)
  private List<SpecimenType> swabTypes;

  @Column(nullable = false)
  private int testLength;

  /** This relationship is necessary for DeviceTypeRepository.findAllByTestOrdersInternalIdIn */
  @OneToMany(mappedBy = "deviceType", fetch = FetchType.LAZY)
  List<TestOrder> testOrders;

  protected DeviceType() {
    /* no-op for hibernate */
  }

  @ConstructorBinding
  public DeviceType(
      String name,
      String manufacturer,
      String model,
      String loincCode,
      String swabType,
      int testLength) {
    super();
    this.name = name;
    this.manufacturer = manufacturer;
    this.model = model;
    this.loincCode = loincCode;
    this.swabType = swabType;
    this.testLength = testLength;
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

  public int getTestLength() {
    return this.testLength;
  }

  public void setTestLength(int testLength) {
    this.testLength = testLength;
  }
}
