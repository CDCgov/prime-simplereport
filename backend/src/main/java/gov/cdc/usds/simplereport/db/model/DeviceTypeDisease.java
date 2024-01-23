package gov.cdc.usds.simplereport.db.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.Objects;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class DeviceTypeDisease extends IdentifiedEntity {

  @Column(name = "device_type_id")
  private UUID deviceTypeId;

  @ManyToOne
  @JoinColumn(name = "supported_disease_id")
  private SupportedDisease supportedDisease;

  @Column private String testPerformedLoincCode;
  @Column private String testPerformedLoincLongName;
  @Column private String equipmentUid;
  @Column private String equipmentUidType;
  @Column private String testkitNameId;
  @Column private String testOrderedLoincCode;
  @Column private String testOrderedLoincLongName;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }

    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    DeviceTypeDisease that = (DeviceTypeDisease) o;
    return Objects.equals(deviceTypeId, that.deviceTypeId)
        && Objects.equals(supportedDisease, that.supportedDisease)
        && Objects.equals(testPerformedLoincCode, that.testPerformedLoincCode)
        && Objects.equals(testOrderedLoincCode, that.testOrderedLoincCode)
        && Objects.equals(equipmentUid, that.equipmentUid)
        && Objects.equals(equipmentUidType, that.equipmentUidType)
        && Objects.equals(testkitNameId, that.testkitNameId)
        && Objects.equals(testPerformedLoincLongName, that.testPerformedLoincLongName)
        && Objects.equals(testOrderedLoincLongName, that.testOrderedLoincLongName);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        deviceTypeId,
        supportedDisease,
        testPerformedLoincCode,
        testOrderedLoincCode,
        equipmentUid,
        equipmentUidType,
        testkitNameId,
        testPerformedLoincLongName,
        testOrderedLoincLongName);
  }
}
