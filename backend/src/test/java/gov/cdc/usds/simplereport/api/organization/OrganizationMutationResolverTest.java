package gov.cdc.usds.simplereport.api.organization;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
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
  @Captor private ArgumentCaptor<DeviceSpecimenTypeHolder> deviceSpecimenCaptor;

  AddressValidationService _avs;
  ApiUserService _aus;
  OrganizationService _os;
  DeviceTypeService _dts;

  @BeforeEach
  void initTestStart() {
    _avs = mock(AddressValidationService.class);
    _aus = mock(ApiUserService.class);
    _os = mock(OrganizationService.class);
    _dts = mock(DeviceTypeService.class);
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void addFacility_withDeviceIds_success() {
    var sut = new OrganizationMutationResolver(_os, _dts, _avs, _aus);
    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);
    var genericDeviceSpecimen = _dataFactory.getGenericDeviceSpecimen();
    var deviceId = genericDeviceSpecimen.getDeviceType().getInternalId().toString();
    var dstHolder =
        new DeviceSpecimenTypeHolder(genericDeviceSpecimen, List.of(genericDeviceSpecimen));

    var address = facility.getAddress();
    doNothing().when(_os).assertFacilityNameAvailable(facility.getFacilityName());
    when(_dts.getTypesForFacility(deviceId, List.of(deviceId))).thenReturn(dstHolder);
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
        List.of(deviceId),
        null,
        deviceId);

    verify(_os)
        .createFacility(
            any(),
            any(),
            any(),
            any(),
            any(),
            deviceSpecimenCaptor.capture(),
            any(),
            any(),
            any(),
            any());

    DeviceSpecimenTypeHolder dst = deviceSpecimenCaptor.getValue();

    assertEquals(genericDeviceSpecimen, dst.getDefault());
    assertEquals(List.of(genericDeviceSpecimen), dst.getFullList());
  }

  @Test
  @SuppressWarnings("checkstyle:IllegalCatch")
  void addFacility_withDeviceSpecimenTypes_success() {
    var sut = new OrganizationMutationResolver(_os, _dts, _avs, _aus);

    var org = _dataFactory.createValidOrg();
    var facility = _dataFactory.createValidFacility(org);
    var address = facility.getAddress();

    var deviceSpecimenType = _dataFactory.getGenericDeviceSpecimen();
    var deviceSpecimenTypeId = deviceSpecimenType.getInternalId().toString();
    var deviceSpecimenTypeIds = List.of(deviceSpecimenTypeId);
    var holder = new DeviceSpecimenTypeHolder(deviceSpecimenType, List.of(deviceSpecimenType));

    doNothing().when(_os).assertFacilityNameAvailable(facility.getFacilityName());
    when(_dts.getDeviceSpecimenTypesForFacility(
            deviceSpecimenType.getDeviceType().getInternalId().toString(), deviceSpecimenTypeIds))
        .thenReturn(holder);
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
        List.of(deviceSpecimenType.getDeviceType().getInternalId().toString()),
        List.of(deviceSpecimenTypeId),
        deviceSpecimenType.getDeviceType().getInternalId().toString());

    verify(_os)
        .createFacility(
            any(),
            any(),
            any(),
            any(),
            any(),
            deviceSpecimenCaptor.capture(),
            any(),
            any(),
            any(),
            any());

    DeviceSpecimenTypeHolder dst = deviceSpecimenCaptor.getValue();

    assertEquals(deviceSpecimenType, dst.getDefault());
    assertEquals(List.of(deviceSpecimenType), dst.getFullList());
  }
}
