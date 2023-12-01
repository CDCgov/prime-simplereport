package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.CreateSpecimenType;
import gov.cdc.usds.simplereport.api.model.UpdateSpecimenType;
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
  private final String NUMERIC_REGEX = "^[0-9]*$";

  @MutationMapping
  public SpecimenType createSpecimenType(@Argument CreateSpecimenType input)
      throws IllegalGraphqlArgumentException {
    return specimenTypeService.createSpecimenType(input);
  }

  @MutationMapping
  public SpecimenType updateSpecimenType(@Argument UpdateSpecimenType input)
      throws IllegalGraphqlArgumentException {
    boolean collectionCodeValid =
        input.getCollectionLocationCode() == null
            || input.getCollectionLocationCode().matches(NUMERIC_REGEX);
    if (!collectionCodeValid) {
      throw new IllegalGraphqlArgumentException(
          "If specified, collection location code needs to be a numeric string");
    }
    return specimenTypeService.updateSpecimenType(input);
  }
}
