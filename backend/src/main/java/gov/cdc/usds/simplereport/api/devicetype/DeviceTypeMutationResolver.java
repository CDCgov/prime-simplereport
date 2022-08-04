package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class DeviceTypeMutationResolver {

  private final DeviceTypeService _dts;

  public DeviceTypeMutationResolver(DeviceTypeService dts) {
    _dts = dts;
  }

  @MutationMapping
  public DeviceType createDeviceType(@Argument CreateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return _dts.createDeviceType(input);
  }

  @MutationMapping
  public DeviceType updateDeviceType(@Argument UpdateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return _dts.updateDeviceType(input);
  }
}
