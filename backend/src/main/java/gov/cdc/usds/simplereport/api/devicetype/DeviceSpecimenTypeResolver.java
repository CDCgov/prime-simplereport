package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class DeviceSpecimenTypeResolver implements GraphQLQueryResolver {

  @Autowired private DeviceTypeService dts;

  public List<DeviceSpecimenType> getDeviceSpecimenTypes() {
    return dts.getDeviceSpecimenTypes();
  }
}
