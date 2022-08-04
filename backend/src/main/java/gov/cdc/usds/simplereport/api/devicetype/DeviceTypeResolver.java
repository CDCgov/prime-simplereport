package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

/** Created by nickrobison on 11/15/20 */
@Controller
@RequiredArgsConstructor
public class DeviceTypeResolver {

  private final DeviceTypeService dts;

  @QueryMapping
  public List<DeviceType> deviceTypes() {
    return dts.fetchDeviceTypes();
  }

  @QueryMapping
  public List<DeviceType> deviceType() {
    return deviceTypes();
  }
}
