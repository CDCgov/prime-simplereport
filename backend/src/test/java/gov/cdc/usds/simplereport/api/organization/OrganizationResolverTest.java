package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.ApiPendingOrganization;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class OrganizationResolverTest {
  @Mock OrganizationQueueService mockedOrganizationQueueService;
  @Mock OrganizationService organizationService;

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

  @Test
  void organization_success() {
    var id = UUID.randomUUID();
    var org = new Organization("name", "type", "123", true);

    when(organizationService.getOrganizationById(id)).thenReturn(org);

    organizationMutationResolver.organization(id);

    verify(organizationService).getOrganizationById(id);
    verify(organizationService).getFacilities(org);
  }

  @Test
  void organization_null() {
    var id = UUID.randomUUID();
    var org = new Organization("name", "type", "123", true);

    when(organizationService.getOrganizationById(id))
        .thenThrow(new IllegalGraphqlArgumentException("error"));

    var actual = organizationMutationResolver.organization(id);

    assertThat(actual).isNull();
    verify(organizationService).getOrganizationById(id);
    verify(organizationService, times(0)).getFacilities(org);
  }

  @Test
  void organizationsByName_success() {
    String orgName = "org name";
    Organization org = new Organization(orgName, "type", "123", true);
    when(organizationService.getOrganizationsByName(orgName, false)).thenReturn(List.of(org));

    organizationMutationResolver.organizationsByName(orgName, false);

    verify(organizationService).getOrganizationsByName(orgName, false);
    verify(organizationService).getFacilities(org);
  }

  @Test
  void organizationsByName_null() {
    String orgName = "org name";
    Organization org = new Organization(orgName, "type", "123", true);
    when(organizationService.getOrganizationsByName(orgName, false)).thenReturn(List.of());

    List<ApiOrganization> actual = organizationMutationResolver.organizationsByName(orgName, false);

    assertThat(actual).isEmpty();
    verify(organizationService).getOrganizationsByName(orgName, false);
    verify(organizationService, never()).getFacilities(org);
  }

  @Test
  void organizationsByNameIsDeleted_success() {
    String orgName = "org name";
    Organization org = new Organization(orgName, "type", "123", true);
    when(organizationService.getOrganizationsByName(orgName, true)).thenReturn(List.of(org));

    organizationMutationResolver.organizationsByName(orgName, true);

    verify(organizationService).getOrganizationsByName(orgName, true);
    verify(organizationService).getFacilities(org);
  }

  @Test
  void sendOrgAdminEmailCSV_success() {
    String type = "patients";
    String state = "NJ";
    organizationMutationResolver.sendOrgAdminEmailCSV(type, state);
    verify(organizationService).sendOrgAdminEmailCSV(type, state);
  }

  @Test
  void sendOrgAdminEmailCSV_unsupportedType_throwsException() {
    String type = "unsupportedType";
    String state = "NJ";
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> {
              organizationMutationResolver.sendOrgAdminEmailCSV(type, state);
            });
    assertEquals("type can be \"facilities\" or \"patients\"", caught.getMessage());
  }

  @Test
  void sendOrgAdminEmailCSV_unsupportedState_throwsException() {
    String type = "patients";
    String state = "ZW";
    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> {
              organizationMutationResolver.sendOrgAdminEmailCSV(type, state);
            });
    assertEquals("Not a valid state", caught.getMessage());
  }
}
