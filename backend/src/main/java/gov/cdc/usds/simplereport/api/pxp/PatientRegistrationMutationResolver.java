package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PatientSelfRegistrationLinkService;
import java.util.Arrays;
import java.util.UUID;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
public class PatientRegistrationMutationResolver {

  private PatientSelfRegistrationLinkService _prls;
  private OrganizationService _os;

  PatientRegistrationMutationResolver(
      PatientSelfRegistrationLinkService prls, OrganizationService os) {
    _prls = prls;
    _os = os;
  }

  @MutationMapping
  public String createOrganizationRegistrationLink(
      @Argument String organizationExternalId, @Argument String link) {
    Organization org = _os.getOrganization(organizationExternalId);
    return _prls.createRegistrationLink(org, link);
  }

  @MutationMapping
  public String createFacilityRegistrationLink(
      @Argument String organizationExternalId, @Argument UUID facilityUuid, @Argument String link) {
    Organization org = _os.getOrganization(organizationExternalId);
    Facility fac = _os.getFacilities(org, Arrays.asList((facilityUuid))).iterator().next();
    return _prls.createRegistrationLink(fac, link);
  }

  @MutationMapping
  public String updateRegistrationLink(@Argument String link, @Argument String newLink) {
    return _prls.updateRegistrationLink(link, newLink);
  }

  @MutationMapping
  public String setRegistrationLinkIsDeleted(@Argument String link, @Argument Boolean deleted) {
    return _prls.updateRegistrationLink(link, deleted);
  }
}
