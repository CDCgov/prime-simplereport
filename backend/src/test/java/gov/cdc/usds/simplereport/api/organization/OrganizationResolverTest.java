package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.ApiPendingOrganization;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class OrganizationResolverTest {
  @Mock OrganizationQueueService mockedOrganizationQueueService;

  @InjectMocks OrganizationResolver organizationMutationResolver;

  @Test
  void getPendingOrganizations_success() {
    // GIVEN
    var orgQueueItem = new OrganizationQueueItem();
    orgQueueItem.editOrganizationQueueItem("OrgName", "0123", new OrganizationAccountRequest());
    List<OrganizationQueueItem> orgQueueItems = List.of(orgQueueItem);

    when(mockedOrganizationQueueService.getUnverifiedQueuedOrganizations())
        .thenReturn(orgQueueItems);
    var expected =
        orgQueueItems.stream().map(ApiPendingOrganization::new).collect(Collectors.toList());

    // WHEN
    var result = organizationMutationResolver.pendingOrganizations();

    // THEN
    assertThat(expected).hasSameSizeAs(result);
    assertThat(expected.get(0).getExternalId()).isEqualTo(result.get(0).getExternalId());
  }
}
