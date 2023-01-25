package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class DeviceTypeMutationResolver {

  private final DeviceTypeService deviceTypeService;

  @MutationMapping
  public DeviceType createDeviceType(@Argument CreateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return deviceTypeService.createDeviceType(input);
  }

  @MutationMapping
  public DeviceType updateDeviceType(@Argument UpdateDeviceType input)
      throws IllegalGraphqlArgumentException {
    return deviceTypeService.updateDeviceType(input);
  }

  @MutationMapping
  public DeviceType markDeviceTypeAsDeleted(@Argument UUID deviceId, @Argument String deviceName)
      throws IllegalGraphqlArgumentException {
    DeviceType device =
        (deviceId != null)
            ? deviceTypeService.getDeviceType(deviceId)
            : deviceTypeService.getDeviceType(deviceName);

    deviceTypeService.removeDeviceType(device);
    return device;
  }
}
