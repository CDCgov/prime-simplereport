package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.ArrayList;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import lombok.Builder;
import lombok.Getter;
import org.springframework.boot.context.properties.ConstructorBinding;

/** The durable (and non-deletable) representation of a POC test device model. */
@Entity
@Getter
public class DeviceType extends EternalAuditedEntity {

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String manufacturer;

  @Column(nullable = false)
  private String model;

  @JoinTable(
      name = "device_specimen_type",
      joinColumns = @JoinColumn(name = "device_type_id"),
      inverseJoinColumns = @JoinColumn(name = "specimen_type_id"))
  @OneToMany(fetch = FetchType.LAZY)
  private List<SpecimenType> swabTypes;

  @Column(nullable = false)
  private int testLength;

  @JsonIgnore
  @OneToMany(mappedBy = "deviceTypeId", cascade = CascadeType.ALL, orphanRemoval = true)
  List<DeviceTypeDisease> supportedDiseaseTestPerformed = new ArrayList<>();

  protected DeviceType() {
    /* no-op for hibernate */
  }

  @ConstructorBinding
  public DeviceType(String name, String manufacturer, String model, int testLength) {
    super();
    this.name = name;
    this.manufacturer = manufacturer;
    this.model = model;
    this.testLength = testLength;
  }

  @Builder
  public DeviceType(
      String name,
      String manufacturer,
      String model,
      int testLength,
      List<SpecimenType> swabTypes) {
    super();
    this.name = name;
    this.manufacturer = manufacturer;
    this.model = model;
    this.swabTypes = swabTypes;
    this.testLength = testLength;
  }

  public DeviceType(
      String name,
      String manufacturer,
      String model,
      int testLength,
      List<SpecimenType> swabTypes,
      List<DeviceTypeDisease> supportedDiseaseTestPerformed) {
    this(name, manufacturer, model, testLength, swabTypes);
    this.supportedDiseaseTestPerformed = supportedDiseaseTestPerformed;
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

  public int getTestLength() {
    return this.testLength;
  }

  public void setTestLength(int testLength) {
    this.testLength = testLength;
  }
}
