package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import org.springframework.stereotype.Component;

@Component
public class DeviceTypeMutationResolver implements GraphQLMutationResolver {

  private final DeviceTypeService _dts;

  public DeviceTypeMutationResolver(DeviceTypeService dts) {
    _dts = dts;
  }

  public DeviceType createDeviceType(CreateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return _dts.createDeviceType(input);
  }

  public DeviceType updateDeviceType(UpdateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return _dts.updateDeviceType(input);
  }
}
