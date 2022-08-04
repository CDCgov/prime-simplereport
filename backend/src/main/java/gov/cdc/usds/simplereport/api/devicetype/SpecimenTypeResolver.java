package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SpecimenTypeResolver {
  private final SpecimenTypeService sts;

  @QueryMapping
  public List<SpecimenType> specimenTypes() {
    return sts.fetchSpecimenTypes();
  }

  @QueryMapping
  public List<SpecimenType> specimenType() {
    return specimenTypes();
  }
}
