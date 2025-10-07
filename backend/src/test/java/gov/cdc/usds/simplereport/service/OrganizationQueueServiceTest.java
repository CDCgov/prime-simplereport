package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
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
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();

    Optional<OrganizationQueueItem> optFetchedQueueItem =
        _service.getUnverifiedQueuedOrganizationByExternalId(createdQueueItem.getExternalId());

    assertTrue(optFetchedQueueItem.isPresent());
    OrganizationQueueItem fetchedQueueItem = optFetchedQueueItem.get();
    assertEquals(createdQueueItem.getOrganizationName(), fetchedQueueItem.getOrganizationName());
  }

  @Test
  void editQueueItem_newOrgName_success() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();

    OrganizationQueueItem editedItem =
        _service.editQueueItem(
            createdQueueItem.getExternalId(),
            Optional.of("Edited Org Queue Name"),
            Optional.empty(),
            Optional.empty(),
            Optional.empty(),
            Optional.empty());

    // external id changed because name changed
    assertNotEquals(createdQueueItem.getExternalId(), editedItem.getExternalId());

    Optional<OrganizationQueueItem> optFetchedQueueItem =
        _service.getUnverifiedQueuedOrganizationByExternalId(editedItem.getExternalId());
    assertEquals(optFetchedQueueItem.get().getOrganizationName(), "Edited Org Queue Name");
  }

  @Test
  void editQueueItem_newAdminName_success() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();

    _service.editQueueItem(
        createdQueueItem.getExternalId(),
        Optional.empty(),
        Optional.of("Sarah"),
        Optional.of("Samuels"),
        Optional.empty(),
        Optional.empty());

    // re-fetch queue item and see changes reflected
    Optional<OrganizationQueueItem> optFetchedQueueItem =
        _service.getUnverifiedQueuedOrganizationByExternalId(createdQueueItem.getExternalId());
    assertEquals(optFetchedQueueItem.get().getRequestData().getFirstName(), "Sarah");
    assertEquals(optFetchedQueueItem.get().getRequestData().getLastName(), "Samuels");
  }

  @Test
  void editQueueItem_newContactInfo_success() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();

    _service.editQueueItem(
        createdQueueItem.getExternalId(),
        Optional.empty(),
        Optional.empty(),
        Optional.empty(),
        Optional.of("foo@bar.com"),
        Optional.of("123-456-7890"));

    // re-fetch queue item and see changes reflected
    Optional<OrganizationQueueItem> optFetchedQueueItem =
        _service.getUnverifiedQueuedOrganizationByExternalId(createdQueueItem.getExternalId());
    assertEquals(optFetchedQueueItem.get().getRequestData().getEmail(), "foo@bar.com");
    assertEquals(optFetchedQueueItem.get().getRequestData().getWorkPhoneNumber(), "123-456-7890");
  }

  @Test
  void editQueueItem_failsToFindValidOrg() {

    Optional<String> editedOrgName = Optional.empty();
    Optional<String> editedOrgAdminFirstName = Optional.empty();
    Optional<String> editedOrgAdminLastName = Optional.empty();
    Optional<String> editedOrgAdminEmail = Optional.of("foo@bar.com");
    Optional<String> editedOrgAdminPhone = Optional.of("123-456-7890");

    Exception exception =
        assertThrows(
            IllegalStateException.class,
            () -> {
              _service.editQueueItem(
                  "nonsense id",
                  editedOrgName,
                  editedOrgAdminFirstName,
                  editedOrgAdminLastName,
                  editedOrgAdminEmail,
                  editedOrgAdminPhone);
            });
    assertEquals(
        exception.getMessage(), "Requesting edits on an organization that does not exist.");
  }

  @Test
  void getUnverifiedQueuedOrganizations_success() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();

    List<OrganizationQueueItem> unverifiedOrgs = _service.getUnverifiedQueuedOrganizations();

    OrganizationQueueItem fetchedQueueItem = unverifiedOrgs.get(0);
    assertEquals(createdQueueItem.getOrganizationName(), fetchedQueueItem.getOrganizationName());
  }

  @Test
  void createAndActivateQueuedOrganization_newOrg_success() {
    OrganizationQueueItem queueItem = _dataFactory.saveOrganizationQueueItem();

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

  @Test
  void deleteQueuedOrg_sucessful() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();
    OrganizationQueueItem deletedQueueItem =
        _service.markPendingOrganizationAsDeleted(createdQueueItem.getExternalId(), true);

    assertThat(deletedQueueItem.isDeleted()).isTrue();
  }

  @Test
  void undeletionQueuedOrg_sucessful() {
    OrganizationQueueItem createdQueueItem = _dataFactory.saveOrganizationQueueItem();
    createdQueueItem.setIsDeleted(true);
    assertThat(createdQueueItem.isDeleted()).isTrue();
    OrganizationQueueItem undeletedItem =
        _service.markPendingOrganizationAsDeleted(createdQueueItem.getExternalId(), false);
    assertThat(undeletedItem.isDeleted()).isFalse();
  }

  @Test
  void deleteQueuedOrg_throwsErrorWhenOrgNotFound() {
    IllegalStateException caught =
        assertThrows(
            IllegalStateException.class,
            // fake external ID
            () -> _service.markPendingOrganizationAsDeleted("some-nonexistent-id", true));
    assertEquals("This organization doesn't exist", caught.getMessage());
  }
}
