package gov.cdc.usds.simplereport.api.supporteddisease;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.service.DiseaseService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class SupportedDiseaseResolver implements GraphQLQueryResolver {
  @Autowired private DiseaseService ds;

  public List<SupportedDisease> getSupportedDiseases() {
    return ds.fetchSupportedDiseases();
  }
}
