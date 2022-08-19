package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SpecimenTypeMutationResolver implements GraphQLMutationResolver {

  private final SpecimenTypeService specimenTypeService;

  public SpecimenType createSpecimenType(CreateSpecimenType input)
      throws IllegalGraphqlArgumentException {
    return specimenTypeService.createSpecimenType(input);
  }
}
