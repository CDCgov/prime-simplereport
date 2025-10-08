package gov.cdc.usds.simplereport.service.model.aphl;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class AimsDeviceSpecimen {
  private final UUID deviceTypeId;
  private final String specimenTypeName;
  private final String specimenTypeCode;
  private final String specimenCollectionLocationName;
  private final String specimenCollectionLocationCode;
}
