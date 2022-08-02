package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DeviceSpecimenTypeResolver {
  private final DeviceTypeService dts;

  public List<DeviceSpecimenType> getDeviceSpecimenTypes() {
    return dts.getDeviceSpecimenTypes();
  }
}
