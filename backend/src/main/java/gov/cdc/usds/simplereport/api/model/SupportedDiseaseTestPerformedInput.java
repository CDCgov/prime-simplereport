package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class SupportedDiseaseTestPerformedInput {
  UUID supportedDisease;
  String testPerformedLoincCode;
  String equipmentUid;
  String testkitNameId;
  String testOrderedLoincCode;
}
