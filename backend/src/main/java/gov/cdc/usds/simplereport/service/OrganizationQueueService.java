package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.repository.OrganizationQueueRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = false)
public class OrganizationQueueService {

  private final OrganizationQueueRepository _orgQueueRepo;

  public OrganizationQueueService(OrganizationQueueRepository orgQueueRepo) {
    _orgQueueRepo = orgQueueRepo;
  }

  public OrganizationQueueItem queueNewRequest(
      String organizationName, String orgExternalId, OrganizationAccountRequest request) {
    return _orgQueueRepo.save(new OrganizationQueueItem(organizationName, orgExternalId, request));
  }

  public String createAndActivateQueuedOrganization(String orgExternalId) {
    Optional<OrganizationQueueItem> optQueueItem = _orgQueueRepo.findByExternalId(orgExternalId);
    if (optQueueItem.isEmpty()) {
      // update this exception?
      throw new IllegalStateException("No queued organization found");
    }

    OrganizationQueueItem queueItem = optQueueItem.get();

    // generate org and user (okta + our db)

    // activate users
    return "fake token";
  }
}
