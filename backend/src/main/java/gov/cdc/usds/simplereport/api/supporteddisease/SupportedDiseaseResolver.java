package gov.cdc.usds.simplereport.api.supporteddisease;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class SupportedDiseaseResolver {
  @Autowired private DiseaseService ds;

  @QueryMapping
  public List<SupportedDisease> supportedDiseases() {
    return ds.fetchSupportedDiseases();
  }
}
