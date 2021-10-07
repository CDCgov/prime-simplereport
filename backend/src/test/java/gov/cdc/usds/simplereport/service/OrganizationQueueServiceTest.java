package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class OrganizationQueueServiceTest extends BaseServiceTest<OrganizationQueueService> {

  @Autowired private TestDataFactory _dataFactory;

  @Autowired private ApiUserRepository _apiUserRepo;
  @Autowired private OrganizationQueueRepository _orgQueueRepo;
  @Autowired private OrganizationRepository _orgRepo;

  @Test
  void queueNewRequest_newOrg_success() {
    String orgName = "My House";
    String orgExtId = "My-House-External-Id";
    String email = "fake@email.org";
    OrganizationQueueItem queueItem =
        _service.queueNewRequest(
            orgName,
            orgExtId,
            new OrganizationAccountRequest(
                "First", "Last", email, "800-555-1212", "CA", null, null));

    assertEquals(orgName, queueItem.getOrganizationName());
    assertEquals(orgExtId, queueItem.getExternalId());
    assertEquals(email, queueItem.getRequestData().getEmail());
  }

  @Test
  void getUnverifiedQueuedOrganizationByExternalId_newOrg_success() {
    OrganizationQueueItem createdQueueItem = _dataFactory.createOrganizationQueueItem();

    Optional<OrganizationQueueItem> optFetchedQueueItem =
        _service.getUnverifiedQueuedOrganizationByExternalId(createdQueueItem.getExternalId());

    assertTrue(optFetchedQueueItem.isPresent());
    OrganizationQueueItem fetchedQueueItem = optFetchedQueueItem.get();
    assertEquals(createdQueueItem.getOrganizationName(), fetchedQueueItem.getOrganizationName());
  }

  @Test
  void createAndActivateQueuedOrganization_newOrg_success() {
    OrganizationQueueItem queueItem = _dataFactory.createOrganizationQueueItem();

    String activationToken = _service.createAndActivateQueuedOrganization(queueItem);
    assertTrue(activationToken.length() > 0);

    Organization org = _orgRepo.findByExternalId(queueItem.getExternalId()).get();
    assertEquals(queueItem.getOrganizationName(), org.getOrganizationName());
    assertEquals(queueItem.getRequestData().getType(), org.getOrganizationType());
    assertTrue(org.getIdentityVerified());

    ApiUser apiUser = _apiUserRepo.findByLoginEmail(queueItem.getRequestData().getEmail()).get();
    assertEquals(queueItem.getRequestData().getLastName(), apiUser.getNameInfo().getLastName());

    Optional<OrganizationQueueItem> optQueueItemAfter =
        _orgQueueRepo.findUnverifiedByExternalId(queueItem.getExternalId());
    assertTrue(optQueueItemAfter.isEmpty()); // the item has been linked to an organization
  }
}
