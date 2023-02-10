package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LIVDResponse {
  private String manufacturer;
  private String model;
  private List<String> vendorSpecimenDescription;
  private String testPerformedLoincCode;
  private String testKitNameId;
  private String equipmentUid;

  //    public LIVDResponse(String manufacturer_a, String model_a, String specimen_description,
  // String s, String testKit_a, String equip_a) {
  //    }
}
