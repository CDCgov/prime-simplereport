package gov.cdc.usds.simplereport.service.model.aphl;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class AimsTestingRequestBody {
  private final List<AimsJurisdiction> jurisdictions;
  private final List<DeviceTypeDisease> deviceTypeDiseases;
  private final List<AimsDeviceSpecimen> deviceSpecimenMappings;
}
