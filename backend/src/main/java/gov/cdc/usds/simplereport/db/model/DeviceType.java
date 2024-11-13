package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonView;
import gov.cdc.usds.simplereport.api.devicetype.PublicDeviceType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

/** The durable (and non-deletable) representation of a POC test device model. */
@Entity
@Getter
@Setter
public class DeviceType extends EternalAuditedEntity {

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String name;

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String manufacturer;

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String model;

  @JoinTable(
      name = "device_specimen_type",
      joinColumns = @JoinColumn(name = "device_type_id"),
      inverseJoinColumns = @JoinColumn(name = "specimen_type_id"))
  @OneToMany(fetch = FetchType.LAZY)
  @JsonView(PublicDeviceType.class)
  private List<SpecimenType> swabTypes;

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private int testLength;

  //  @JsonIgnore
  @OneToMany(mappedBy = "deviceTypeId", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonView(PublicDeviceType.class)
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

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DeviceType that = (DeviceType) o;
    return Objects.equals(model, that.model)
        && Objects.equals(name, that.name)
        && Objects.equals(testLength, that.testLength)
        && Objects.equals(manufacturer, that.manufacturer);
  }

  @Override
  public int hashCode() {
    return Objects.hash(model, name, testLength, manufacturer);
  }
}
