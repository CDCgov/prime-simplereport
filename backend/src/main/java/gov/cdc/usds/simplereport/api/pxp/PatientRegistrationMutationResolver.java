package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PatientRegistrationLinkService;
import graphql.kickstart.tools.GraphQLMutationResolver;

import java.util.Arrays;
import java.util.UUID;

import org.springframework.stereotype.Component;

@Component
public class PatientRegistrationMutationResolver implements GraphQLMutationResolver {

  private PatientRegistrationLinkService _prls;
  private OrganizationService _os;

  PatientRegistrationMutationResolver(PatientRegistrationLinkService prls, OrganizationService os) {
    _prls = prls;
    _os = os;
  }

  public String createOrganizationRegistrationLink(String organizationExternalId, String link) {
    Organization org = _os.getOrganization(organizationExternalId);
    return _prls.createRegistrationLink(org, link);
  }

  public String createFacilityRegistrationLink(String organizationExternalId, UUID facilityUuid, String link) {
    Organization org = _os.getOrganization(organizationExternalId);
    Facility fac = _os.getFacilities(org, Arrays.asList((facilityUuid))).iterator().next();
    return _prls.createRegistrationLink(fac, link);
  }
}
