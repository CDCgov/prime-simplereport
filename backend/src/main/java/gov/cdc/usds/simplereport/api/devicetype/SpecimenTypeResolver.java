package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.SpecimenTypeService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SpecimenTypeResolver {
  private final SpecimenTypeService sts;

  public List<SpecimenType> getSpecimenTypes() {
    return sts.fetchSpecimenTypes();
  }

  public List<SpecimenType> getSpecimenType() {
    return getSpecimenTypes();
  }
}
