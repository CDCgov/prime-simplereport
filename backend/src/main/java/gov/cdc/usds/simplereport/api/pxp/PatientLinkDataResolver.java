package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.api.model.ApiTestOrder;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PatientLinkDataResolver {

  @SchemaMapping(typeName = "PatientLink", field = "testOrder")
  public ApiTestOrder getTestOrder(PatientLink pl) {
    return new ApiTestOrder(pl.getTestOrder());
  }
}
