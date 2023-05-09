package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@WithSimpleReportStandardUser
class OrganizationMutationResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private ApiUserRepository _apiUserRepository;
  @Captor private ArgumentCaptor<List<UUID>> deviceIdTypeCaptor;

  @Mock AddressValidationService mockedAddressValidationService;
  @Mock ApiUserService mockedApiUserService;
  @Mock OrganizationService mockedOrganizationService;
  @Mock OrganizationQueueService mockedOrganizationQueueService;
  @InjectMocks OrganizationMutationResolver organizationMutationResolver;

  private Facility facility;
  private StreetAddress address;
  private Organization organization;

  private OrganizationQueueItem pendingOrg;
  private final UUID deviceId = UUID.randomUUID();
  private UserInfo orgUserInfo;

  @BeforeEach
  void setup() {
    Organization org = _dataFactory.saveValidOrganization();
    organization = org;
    facility = _dataFactory.createValidFacility(org);
    pendingOrg = _dataFactory.saveOrganizationQueueItem();
    address = facility.getAddress();
    orgUserInfo = _dataFactory.createValidApiUser("demo@example.com", org);
  }

  @Test
  void addFacility_withDeviceIds_success() {
    // GIVEN
    doNothing()
        .when(mockedOrganizationService)
        .assertFacilityNameAvailable(facility.getFacilityName());
    when(mockedAddressValidationService.getValidatedAddress(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            "facility"))
        .thenReturn(address);

    // WHEN
    organizationMutationResolver.addFacility(
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress().getStreetOne(),
        facility.getAddress().getStreetTwo(),
        facility.getAddress().getCity(),
        facility.getAddress().getState(),
        facility.getAddress().getPostalCode(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getOrderingProvider().getNameInfo().getFirstName(),
        facility.getOrderingProvider().getNameInfo().getMiddleName(),
        facility.getOrderingProvider().getNameInfo().getLastName(),
        facility.getOrderingProvider().getNameInfo().getSuffix(),
        facility.getOrderingProvider().getProviderId(),
        facility.getOrderingProvider().getAddress().getStreetOne(),
        facility.getOrderingProvider().getAddress().getStreetTwo(),
        facility.getOrderingProvider().getAddress().getCity(),
        facility.getOrderingProvider().getAddress().getCounty(),
        facility.getOrderingProvider().getAddress().getState(),
        facility.getOrderingProvider().getAddress().getPostalCode(),
        facility.getOrderingProvider().getTelephone(),
        List.of(deviceId),
        null);

    // THEN
    verify(mockedOrganizationService)
        .createFacility(
            eq("Imaginary Site"),
            eq("123456"),
            eq(facility.getAddress()),
            eq("(555) 867-5309"),
            eq("facility@test.com"),
            deviceIdTypeCaptor.capture(),
            eq(facility.getOrderingProvider().getNameInfo()),
            eq(facility.getOrderingProvider().getAddress()),
            eq("(800) 555-1212"),
            eq("DOOOOOOM"));

    List<UUID> deviceIds = deviceIdTypeCaptor.getValue();
    assertThat(deviceIds).hasSize(1).contains(deviceId);
  }

  @Test
  void updateFacility_success() {
    // GIVEN
    when(mockedAddressValidationService.getValidatedAddress(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            "facility"))
        .thenReturn(address);

    // WHEN
    organizationMutationResolver.updateFacility(
        facility.getInternalId(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress().getStreetOne(),
        facility.getAddress().getStreetTwo(),
        facility.getAddress().getCity(),
        facility.getAddress().getState(),
        facility.getAddress().getPostalCode(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getOrderingProvider().getNameInfo().getFirstName(),
        facility.getOrderingProvider().getNameInfo().getMiddleName(),
        facility.getOrderingProvider().getNameInfo().getLastName(),
        facility.getOrderingProvider().getNameInfo().getSuffix(),
        facility.getOrderingProvider().getProviderId(),
        facility.getOrderingProvider().getAddress().getStreetOne(),
        facility.getOrderingProvider().getAddress().getStreetTwo(),
        facility.getOrderingProvider().getAddress().getCity(),
        facility.getOrderingProvider().getAddress().getCounty(),
        facility.getOrderingProvider().getAddress().getState(),
        facility.getOrderingProvider().getAddress().getPostalCode(),
        facility.getOrderingProvider().getTelephone(),
        List.of(deviceId),
        null);

    // THEN
    verify(mockedOrganizationService)
        .updateFacility(
            eq(facility.getInternalId()),
            eq("Imaginary Site"),
            eq("123456"),
            eq(facility.getAddress()),
            eq("(555) 867-5309"),
            eq("facility@test.com"),
            eq(facility.getOrderingProvider().getNameInfo()),
            eq(facility.getOrderingProvider().getAddress()),
            eq("DOOOOOOM"),
            eq("(800) 555-1212"),
            deviceIdTypeCaptor.capture());

    List<UUID> deviceIds = deviceIdTypeCaptor.getValue();
    assertThat(deviceIds).hasSize(1).contains(deviceId);
  }

  @Test
  void markFacilityAsDeleted_true() {
    // WHEN
    organizationMutationResolver.markFacilityAsDeleted(facility.getInternalId(), true);

    // THEN
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), true);
  }

  @Test
  void markFacilityAsDeleted_false() {
    // WHENa
    organizationMutationResolver.markFacilityAsDeleted(facility.getInternalId(), false);

    // THEN
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), false);
  }

  @Test
  void markOrganizationAsDeleted_true() {
    Boolean deleted = true;
    Set<Facility> facilities = new HashSet<>();
    facilities.add(facility);
    ApiUser user = _apiUserRepository.findByLoginEmail(orgUserInfo.getEmail()).orElse(null);

    // WHEN
    when(mockedOrganizationService.getOrganizationById(organization.getInternalId()))
        .thenReturn(organization);
    when(mockedApiUserService.getAllUsersByOrganization(organization)).thenReturn(List.of(user));
    when(mockedOrganizationService.getFacilitiesIncludeArchived(organization, !deleted))
        .thenReturn(facilities);

    organizationMutationResolver.markOrganizationAsDeleted(organization.getInternalId(), deleted);

    // THEN
    verify(mockedOrganizationService)
        .markOrganizationAsDeleted(organization.getInternalId(), deleted);
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), deleted);
    verify(mockedApiUserService).getAllUsersByOrganization(organization);
    verify(mockedApiUserService).setIsDeleted(orgUserInfo.getInternalId(), deleted);
  }

  @Test
  void markOrganizationAsDeleted_false() {
    Boolean deleted = false;
    Set<Facility> facilities = new HashSet<>();
    facilities.add(facility);
    ApiUser user = _apiUserRepository.findByLoginEmail(orgUserInfo.getEmail()).orElse(null);
    // WHEN
    when(mockedOrganizationService.getOrganizationById(organization.getInternalId()))
        .thenReturn(organization);
    when(mockedApiUserService.getAllUsersByOrganization(organization)).thenReturn(List.of(user));
    when(mockedOrganizationService.getFacilitiesIncludeArchived(organization, !deleted))
        .thenReturn(facilities);
    organizationMutationResolver.markOrganizationAsDeleted(organization.getInternalId(), deleted);

    // THEN
    verify(mockedOrganizationService)
        .markOrganizationAsDeleted(organization.getInternalId(), deleted);
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), deleted);
    verify(mockedApiUserService).setIsDeleted(orgUserInfo.getInternalId(), deleted);
  }

  @Test
  void markPendingOrgDeleted_false() {
    // WHEN
    organizationMutationResolver.markPendingOrganizationAsDeleted(
        pendingOrg.getExternalId(), false);
    // THEN
    verify(mockedOrganizationQueueService)
        .markPendingOrganizationAsDeleted(pendingOrg.getExternalId(), false);
  }

  @Test
  void markPendingOrgDeleted_true() {
    // WHEN
    organizationMutationResolver.markPendingOrganizationAsDeleted(pendingOrg.getExternalId(), true);

    // THEN
    verify(mockedOrganizationQueueService)
        .markPendingOrganizationAsDeleted(pendingOrg.getExternalId(), true);
  }
}
