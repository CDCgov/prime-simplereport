package gov.cdc.usds.simplereport.api.model;

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
  String equipmentUid;
  String testkitNameId;
  String testOrderedLoincCode;
}
