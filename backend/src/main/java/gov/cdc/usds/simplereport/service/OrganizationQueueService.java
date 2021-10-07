package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = false)
public class OrganizationQueueService {

  private final ApiUserService _apiUserService;
  private final OrganizationQueueRepository _orgQueueRepo;
  private final OrganizationService _orgService;

  public OrganizationQueueService(
      ApiUserService apiUserService,
      OrganizationQueueRepository orgQueueRepo,
      OrganizationService orgService) {
    _apiUserService = apiUserService;
    _orgQueueRepo = orgQueueRepo;
    _orgService = orgService;
  }

  public OrganizationQueueItem queueNewRequest(
      String organizationName, String orgExternalId, OrganizationAccountRequest request) {
    return _orgQueueRepo.save(new OrganizationQueueItem(organizationName, orgExternalId, request));
  }

  public Optional<OrganizationQueueItem> getQueuedOrganizationByExternalId(String orgExternalId) {
    return _orgQueueRepo.findUnverifiedByExternalId(orgExternalId);
  }

  public String createAndActivateQueuedOrganization(OrganizationQueueItem queueItem) {
    OrganizationAccountRequest request = queueItem.getRequestData();

    // create org and user
    String organizationType = Translators.parseOrganizationType(request.getType());
    Organization org =
        _orgService.createOrganization(
            queueItem.getOrganizationName(), organizationType, queueItem.getExternalId());

    // create admin user
    PersonName adminName =
        Translators.consolidateNameArguments(
            null, request.getFirstName(), null, request.getLastName(), null);
    UserInfo adminUser =
        _apiUserService.createUser(request.getEmail(), adminName, org.getExternalId(), Role.ADMIN);

    // identity verify and activate, returning activation token)
    return _orgService.verifyOrganizationNoPermissions(org.getExternalId());
  }
}
