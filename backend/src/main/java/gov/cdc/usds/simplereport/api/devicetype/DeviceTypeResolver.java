package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/15/20 */
@Component
public class DeviceTypeResolver implements GraphQLQueryResolver {

  @Autowired private DeviceTypeService dts;

  public List<DeviceType> getDeviceTypes() {
    return dts.fetchDeviceTypes();
  }

  public List<DeviceType> getDeviceType() {
    return getDeviceTypes();
  }
}
