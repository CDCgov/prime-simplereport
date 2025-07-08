package gov.cdc.usds.simplereport.api.organization;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.AddFacilityInput;
import gov.cdc.usds.simplereport.api.model.AddressInput;
import gov.cdc.usds.simplereport.api.model.ProviderInput;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.UpdateFacilityInput;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
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
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;

@WithSimpleReportStandardUser
class OrganizationMutationResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private ApiUserRepository _apiUserRepository;
  @Captor private ArgumentCaptor<List<UUID>> deviceIdTypeCaptor;

  @Mock AddressValidationService mockedAddressValidationService;
  @Mock ApiUserService mockedApiUserService;
  @Mock OrganizationService mockedOrganizationService;
  @Mock OrganizationQueueService mockedOrganizationQueueService;
  @Mock TestOrderService mockedtestOrderService;
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
    orgUserInfo =
        _dataFactory.createValidApiUser("demo@example.com", org, Role.USER, Set.of(facility));
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
            address.getPostalCode()))
        .thenReturn(address);

    // WHEN
    organizationMutationResolver.addFacility(
        AddFacilityInput.builder()
            .facilityName(facility.getFacilityName())
            .cliaNumber(facility.getCliaNumber())
            .address(
                AddressInput.builder()
                    .street(facility.getAddress().getStreetOne())
                    .streetTwo(facility.getAddress().getStreetTwo())
                    .city(facility.getAddress().getCity())
                    .state(facility.getAddress().getState())
                    .zipCode(facility.getAddress().getPostalCode())
                    .build())
            .phone(facility.getTelephone())
            .email(facility.getEmail())
            .orderingProvider(
                ProviderInput.builder()
                    .firstName(facility.getOrderingProvider().getNameInfo().getFirstName())
                    .middleName(facility.getOrderingProvider().getNameInfo().getMiddleName())
                    .lastName(facility.getOrderingProvider().getNameInfo().getLastName())
                    .suffix(facility.getOrderingProvider().getNameInfo().getSuffix())
                    .npi(facility.getOrderingProvider().getProviderId())
                    .street(facility.getOrderingProvider().getAddress().getStreetOne())
                    .streetTwo(facility.getOrderingProvider().getAddress().getStreetTwo())
                    .city(facility.getOrderingProvider().getAddress().getCity())
                    .county(facility.getOrderingProvider().getAddress().getCounty())
                    .state(facility.getOrderingProvider().getAddress().getState())
                    .zipCode(facility.getOrderingProvider().getAddress().getPostalCode())
                    .phone(facility.getOrderingProvider().getTelephone())
                    .build())
            .deviceIds(List.of(deviceId))
            .build());

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
            address.getPostalCode()))
        .thenReturn(address);

    // WHEN
    organizationMutationResolver.updateFacility(
        UpdateFacilityInput.builder()
            .facilityId(facility.getInternalId())
            .facilityName(facility.getFacilityName())
            .cliaNumber(facility.getCliaNumber())
            .address(
                AddressInput.builder()
                    .street(facility.getAddress().getStreetOne())
                    .streetTwo(facility.getAddress().getStreetTwo())
                    .city(facility.getAddress().getCity())
                    .state(facility.getAddress().getState())
                    .zipCode(facility.getAddress().getPostalCode())
                    .build())
            .phone(facility.getTelephone())
            .email(facility.getEmail())
            .orderingProvider(
                ProviderInput.builder()
                    .firstName(facility.getOrderingProvider().getNameInfo().getFirstName())
                    .middleName(facility.getOrderingProvider().getNameInfo().getMiddleName())
                    .lastName(facility.getOrderingProvider().getNameInfo().getLastName())
                    .suffix(facility.getOrderingProvider().getNameInfo().getSuffix())
                    .npi(facility.getOrderingProvider().getProviderId())
                    .street(facility.getOrderingProvider().getAddress().getStreetOne())
                    .streetTwo(facility.getOrderingProvider().getAddress().getStreetTwo())
                    .city(facility.getOrderingProvider().getAddress().getCity())
                    .county(facility.getOrderingProvider().getAddress().getCounty())
                    .state(facility.getOrderingProvider().getAddress().getState())
                    .zipCode(facility.getOrderingProvider().getAddress().getPostalCode())
                    .phone(facility.getOrderingProvider().getTelephone())
                    .build())
            .deviceIds(List.of(deviceId))
            .build());

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
    verify(mockedtestOrderService).removeFromQueueByFacilityId(facility.getInternalId());
  }

  @Test
  void markFacilityAsDeleted_false() {
    // WHEN
    organizationMutationResolver.markFacilityAsDeleted(facility.getInternalId(), false);

    // THEN
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), false);
    verify(mockedtestOrderService, never()).removeFromQueueByFacilityId(facility.getInternalId());
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
    verify(mockedtestOrderService).removeFromQueueByFacilityId(facility.getInternalId());
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
    verify(mockedtestOrderService, never()).removeFromQueueByFacilityId(facility.getInternalId());
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

  @Test
  void sendOrgAdminEmailCSV_success() {
    String type = "patients";
    String state = "NJ";
    organizationMutationResolver.sendOrgAdminEmailCSV(type, state);
    verify(mockedOrganizationService, times(1)).sendOrgAdminEmailCSV(type, state);
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
