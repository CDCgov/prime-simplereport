package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class DeviceTypeMutationResolver implements GraphQLMutationResolver {

  private final DeviceTypeService _dts;

  public DeviceTypeMutationResolver(DeviceTypeService dts) {
    _dts = dts;
  }

  public DeviceType createDeviceType(
      String name, String manufacturer, String model, String loincCode, String swabType)
      throws IllegalGraphqlArgumentException {
    return _dts.createDeviceType(name, model, manufacturer, loincCode, swabType);
  }

  public DeviceType updateDeviceType(
      UUID id, String name, String manufacturer, String model, String loincCode, String swabType)
      throws IllegalGraphqlArgumentException {
    return _dts.updateDeviceType(id, name, model, manufacturer, loincCode, swabType);
  }
}
