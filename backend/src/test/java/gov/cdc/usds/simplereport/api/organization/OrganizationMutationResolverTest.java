package gov.cdc.usds.simplereport.api.organization;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;

@WithSimpleReportStandardUser // hackedy hack
class OrganizationMutationResolverTest extends BaseServiceTest<PersonService> {
  @Autowired private TestDataFactory _dataFactory;
  @Captor private ArgumentCaptor<List<DeviceType>> deviceTypeCaptor;

  AddressValidationService _avs;
  ApiUserService _aus;
  OrganizationService _os;
  OrganizationQueueService _oqs;
  DeviceTypeService _dts;

  @BeforeEach
  void initTestStart() {
    _avs = mock(AddressValidationService.class);
    _aus = mock(ApiUserService.class);
    _os = mock(OrganizationService.class);
    _oqs = mock(OrganizationQueueService.class);
    _dts = mock(DeviceTypeService.class);
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void addFacility_withDeviceIds_success() {
    var sut = new OrganizationMutationResolver(_os, _oqs, _dts, _avs, _aus);
    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);
    var genericDeviceSpecimen = _dataFactory.getGenericDeviceSpecimen();
    var genericDevice = genericDeviceSpecimen.getDeviceType();
    var deviceId = genericDevice.getInternalId();

    var address = facility.getAddress();
    doNothing().when(_os).assertFacilityNameAvailable(facility.getFacilityName());
    when(_dts.getDeviceTypesByIds(List.of(deviceId))).thenReturn(List.of(genericDevice));
    when(_avs.getValidatedAddress(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            "facility"))
        .thenReturn(address);

    sut.addFacility(
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
        List.of(deviceId.toString()));

    verify(_os)
        .createFacility(
            any(),
            any(),
            any(),
            any(),
            any(),
            deviceTypeCaptor.capture(),
            any(),
            any(),
            any(),
            any());

    List<DeviceType> devices = deviceTypeCaptor.getValue();
    assertEquals(List.of(genericDeviceSpecimen.getDeviceType()), devices);
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void addFacility_withDeviceSpecimenTypes_success() {
    var sut = new OrganizationMutationResolver(_os, _oqs, _dts, _avs, _aus);

    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);
    var address = facility.getAddress();

    var genericDeviceSpecimen = _dataFactory.getGenericDeviceSpecimen();
    var genericDevice = genericDeviceSpecimen.getDeviceType();
    var deviceId = genericDevice.getInternalId();

    doNothing().when(_os).assertFacilityNameAvailable(facility.getFacilityName());
    when(_dts.getDeviceTypesByIds(List.of(deviceId))).thenReturn(List.of(genericDevice));
    when(_avs.getValidatedAddress(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode(),
            "facility"))
        .thenReturn(address);

    sut.addFacility(
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
        List.of(deviceId.toString()));

    verify(_os)
        .createFacility(
            any(),
            any(),
            any(),
            any(),
            any(),
            deviceTypeCaptor.capture(),
            any(),
            any(),
            any(),
            any());

    List<DeviceType> devices = deviceTypeCaptor.getValue();
    assertEquals(List.of(genericDevice), devices);
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void markFacilityAsDeleted_true() {
    OrganizationMutationResolver resolver =
        new OrganizationMutationResolver(_os, _oqs, _dts, _avs, _aus);

    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);

    resolver.markFacilityAsDeleted(facility.getInternalId(), true);
    verify(_os).markFacilityAsDeleted(facility.getInternalId(), true);
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void markFacilityAsDeleted_false() {
    OrganizationMutationResolver resolver =
        new OrganizationMutationResolver(_os, _oqs, _dts, _avs, _aus);

    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);

    resolver.markFacilityAsDeleted(facility.getInternalId(), false);
    verify(_os).markFacilityAsDeleted(facility.getInternalId(), false);
  }
}
