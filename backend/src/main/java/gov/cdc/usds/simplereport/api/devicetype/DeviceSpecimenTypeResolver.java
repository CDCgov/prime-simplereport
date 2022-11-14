package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class DeviceSpecimenTypeResolver {
  private final DeviceTypeService dts;

  @QueryMapping
  public List<DeviceSpecimenType> deviceSpecimenTypes() {
    return dts.getDeviceSpecimenTypes();
  }
}
