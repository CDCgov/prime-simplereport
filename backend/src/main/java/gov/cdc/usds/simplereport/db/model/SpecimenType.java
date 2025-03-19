package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonView;
import gov.cdc.usds.simplereport.api.devicetype.PublicDeviceType;
import gov.cdc.usds.simplereport.validators.NumericCode;
import gov.cdc.usds.simplereport.validators.RequiredNumericCode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.NaturalId;
import org.springframework.boot.context.properties.bind.ConstructorBinding;

/** A SNOMED-registered specimen type that can be used by one or more {@link DeviceType}s. */
@Entity
@EqualsAndHashCode(callSuper = false)
public class SpecimenType extends EternalAuditedEntity {

  @Column(nullable = false)
  @JsonView(PublicDeviceType.class)
  private String name;

  @Column(nullable = false, updatable = false)
  @RequiredNumericCode
  @NaturalId
  @JsonView(PublicDeviceType.class)
  private String typeCode;

  @Column
  @JsonView(PublicDeviceType.class)
  private String collectionLocationName;

  @Column
  @NumericCode
  @JsonView(PublicDeviceType.class)
  private String collectionLocationCode;

  protected SpecimenType() {} // for hibernate

  @ConstructorBinding
  public SpecimenType(
      String name, String typeCode, String collectionLocationName, String collectionLocationCode) {
    this(name, typeCode);
    this.collectionLocationName = collectionLocationName;
    this.collectionLocationCode = collectionLocationCode;
  }

  public SpecimenType(String name, String typeCode) {
    this.name = name;
    this.typeCode = typeCode;
  }

  /** The human readable name for this specimen type (e.g. "swab of interior nose") */
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  /** The SNOMED code for this specimen type */
  public String getTypeCode() {
    return typeCode;
  }

  /**
   * The human-readable name for the specimen collection location (e.g. "nasal structure", which is
   * probably redundant)
   */
  public String getCollectionLocationName() {
    return collectionLocationName;
  }

  public void setCollectionLocationName(String collectionLocation) {
    this.collectionLocationName = collectionLocation;
  }

  /** The SNOMED code for this specimen type */
  public String getCollectionLocationCode() {
    return collectionLocationCode;
  }

  public void setCollectionLocationCode(String collectionLocationCode) {
    this.collectionLocationCode = collectionLocationCode;
  }
}
