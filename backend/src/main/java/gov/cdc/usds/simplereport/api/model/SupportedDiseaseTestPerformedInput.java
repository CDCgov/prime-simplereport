package gov.cdc.usds.simplereport.api.model;

import java.util.Objects;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

@Builder
@Getter
@ToString
public class SupportedDiseaseTestPerformedInput {
  UUID supportedDisease;
  String testPerformedLoincCode;
  String testPerformedLoincLongName;
  String equipmentUid;
  String equipmentUidType;
  String testkitNameId;
  String testOrderedLoincCode;
  String testOrderedLoincLongName;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    SupportedDiseaseTestPerformedInput that = (SupportedDiseaseTestPerformedInput) o;
    return Objects.equals(supportedDisease, that.supportedDisease)
        && Objects.equals(testPerformedLoincCode, that.testPerformedLoincCode)
        && Objects.equals(testPerformedLoincLongName, that.testPerformedLoincLongName)
        && Objects.equals(equipmentUid, that.equipmentUid)
        && Objects.equals(equipmentUidType, that.equipmentUidType)
        && Objects.equals(testkitNameId, that.testkitNameId)
        && Objects.equals(testOrderedLoincCode, that.testOrderedLoincCode)
        && Objects.equals(testOrderedLoincLongName, that.testOrderedLoincLongName);
  }
}
