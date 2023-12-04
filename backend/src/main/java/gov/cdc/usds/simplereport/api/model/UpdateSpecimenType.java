package gov.cdc.usds.simplereport.api.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateSpecimenType {
  private final String name;
  private final String typeCode;
  private final String collectionLocationName;
  private final String collectionLocationCode;

  // can potentially add isDeleted here if needed in the future
}
