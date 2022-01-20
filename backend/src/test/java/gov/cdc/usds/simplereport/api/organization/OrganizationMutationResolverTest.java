package gov.cdc.usds.simplereport.api.organization;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Optional;
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
  @Captor private ArgumentCaptor<List<UUID>> deviceIdTypeCaptor;

  @Mock AddressValidationService mockedAddressValidationService;
  @Mock ApiUserService mockedApiUserService;
  @Mock OrganizationService mockedOrganizationService;
  @Mock OrganizationQueueService mockedOrganizationQueueService;
  @Mock DeviceSpecimenTypeRepository mockedDeviceSpecimenTypeRepository;
  @InjectMocks OrganizationMutationResolver organizationMutationResolver;

  private Facility facility;
  private OrganizationQueueItem pendingOrg;
  private DeviceSpecimenType genericDeviceSpecimen;
  private UUID deviceId;
  private StreetAddress address;

  @BeforeEach
  void setup() {
    Organization org = _dataFactory.createValidOrg();
    facility = _dataFactory.createValidFacility(org);
    pendingOrg = _dataFactory.createOrganizationQueueItem();
    genericDeviceSpecimen = _dataFactory.getGenericDeviceSpecimen();
    DeviceType genericDevice = genericDeviceSpecimen.getDeviceType();
    deviceId = genericDevice.getInternalId();
    address = facility.getAddress();
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
    organizationMutationResolver.addFacilityNew(
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
        List.of(deviceId));

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
  void addFacility_withDeviceSpecimenType_backwardCompatible_success() {
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
    when(mockedDeviceSpecimenTypeRepository.findById(any()))
        .thenReturn(Optional.of(genericDeviceSpecimen));

    // WHEN
    organizationMutationResolver.addFacility(
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress().getStreetOne(),
        facility.getAddress().getStreetTwo(),
        facility.getAddress().getCity(),
        facility.getAddress().getCounty(),
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
        List.of(deviceId.toString()),
        List.of(genericDeviceSpecimen.getInternalId()),
        deviceId.toString());

    // THEN
    verify(mockedOrganizationService)
        .createFacility(
            any(),
            any(),
            any(),
            any(),
            any(),
            deviceIdTypeCaptor.capture(),
            any(),
            any(),
            any(),
            any());

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
    organizationMutationResolver.updateFacilityNew(
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
        List.of(deviceId));

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
  void updateFacility_backwardCompatible_success() {
    // GIVEN
    when(mockedAddressValidationService.getValidatedAddress(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            "facility"))
        .thenReturn(address);
    when(mockedDeviceSpecimenTypeRepository.findById(any()))
        .thenReturn(Optional.of(genericDeviceSpecimen));

    // WHEN
    organizationMutationResolver.updateFacility(
        facility.getInternalId(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress().getStreetOne(),
        facility.getAddress().getStreetTwo(),
        facility.getAddress().getCity(),
        facility.getAddress().getCounty(),
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
        emptyList(),
        List.of(genericDeviceSpecimen.getInternalId()),
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
    // WHEN
    organizationMutationResolver.markFacilityAsDeleted(facility.getInternalId(), false);

    // THEN
    verify(mockedOrganizationService).markFacilityAsDeleted(facility.getInternalId(), false);
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
