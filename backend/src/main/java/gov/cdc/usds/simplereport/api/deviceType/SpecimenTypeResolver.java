package gov.cdc.usds.simplereport.api.deviceType;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SpecimenTypeResolver implements GraphQLQueryResolver {

  @Autowired private DeviceTypeService dts;

  public List<SpecimenType> getSpecimenTypes() {
    return dts.getSpecimenTypes();
  }
}
