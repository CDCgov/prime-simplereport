package gov.cdc.usds.simplereport.api.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UpdateSpecimenType {
  public String name;
  public String typeCode;
  public String collectionLocationName;
  public String collectionLocationCode;

  // can potentially add isDeleted here if needed in the future
}
