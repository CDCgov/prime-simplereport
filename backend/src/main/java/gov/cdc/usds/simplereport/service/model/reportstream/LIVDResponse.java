package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@Builder
public class LIVDResponse {
  private String manufacturer;
  private String model;
  private List<String> vendorSpecimenDescription;
  private String vendorAnalyteName;
  private String testPerformedLoincCode;
  private String testOrderedLoincCode;
  private String testKitNameId;
  private String equipmentUid;
  private String equipmentUidType;
  private String testOrderedLoincLongName;
  private String testPerformedLoincLongName;
}
