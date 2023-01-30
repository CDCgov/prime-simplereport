package gov.cdc.usds.simplereport.db.model;

import java.util.List;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConstructorBinding;

/** The durable (and non-deletable) representation of a POC test device model. */
@Entity
@Getter
@Setter
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

  @JoinTable(
      name = "device_supported_disease",
      joinColumns = @JoinColumn(name = "device_type_id"),
      inverseJoinColumns = @JoinColumn(name = "supported_disease_id"))
  @OneToMany(fetch = FetchType.LAZY)
  @Setter
  private List<SupportedDisease> supportedDiseases;

  @Column(nullable = false)
  private int testLength;

  protected DeviceType() {
    /* no-op for hibernate */
  }

  @ConstructorBinding
  public DeviceType(
      String name, String manufacturer, String model, String loincCode, int testLength) {
    super();
    this.name = name;
    this.manufacturer = manufacturer;
    this.model = model;
    this.loincCode = loincCode;
    this.testLength = testLength;
  }
}
