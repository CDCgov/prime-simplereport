package gov.cdc.usds.simplereport.api.deviceType;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by nickrobison on 11/15/20
 */
@Component
public class DeviceTypeResolver implements GraphQLQueryResolver {

  @Autowired
  private DeviceTypeService dts;

  public List<DeviceType> getDeviceType() {
    return dts.fetchDeviceTypes();
  }

  public DeviceType getDeviceTypeById(String internalId) {
    return dts.getDeviceType(internalId);
  }
}
