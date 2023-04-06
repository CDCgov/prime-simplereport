package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class SpecimenTypeMutationResolver {

  private final SpecimenTypeService specimenTypeService;

  @MutationMapping
  public SpecimenType createSpecimenType(@Argument CreateSpecimenType input)
      throws IllegalGraphqlArgumentException {
    return specimenTypeService.createSpecimenType(input);
  }
}
