package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SpecimenTypeResolver implements GraphQLQueryResolver {

  @Autowired private SpecimenTypeService sts;

  public List<SpecimenType> getSpecimenTypes() {
    return sts.fetchSpecimenTypes();
  }

  public List<SpecimenType> getSpecimenType() {
    return getSpecimenTypes();
  }
}
