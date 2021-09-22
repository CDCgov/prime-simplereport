package gov.cdc.usds.simplereport.api.deviceType;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/15/20 */
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
