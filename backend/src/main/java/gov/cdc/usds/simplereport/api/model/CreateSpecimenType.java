package gov.cdc.usds.simplereport.api.model;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateSpecimenType {
  public String name;
  public String typeCode;
  public String collectionLocationName;
  public String collectionLocationCode;
}
