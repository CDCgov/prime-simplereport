package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class OrganizationMutationResolver implements GraphQLMutationResolver {

  private final OrganizationService _os;
  private final DeviceTypeService _dts;
  private final AddressValidationService _avs;
  private final ApiUserService _aus;

  public OrganizationMutationResolver(
      OrganizationService os,
      DeviceTypeService dts,
      AddressValidationService avs,
      ApiUserService aus) {
    _os = os;
    _dts = dts;
    _avs = avs;
    _aus = aus;
  }

  public ApiFacility addFacility(
      String testingFacilityName,
      String cliaNumber,
      String street,
      String streetTwo,
      String city,
      String county,
      String state,
      String zipCode,
      String phone,
      String email,
      String orderingProviderFirstName,
      String orderingProviderMiddleName,
      String orderingProviderLastName,
      String orderingProviderSuffix,
      String orderingProviderNPI,
      String orderingProviderStreet,
      String orderingProviderStreetTwo,
      String orderingProviderCity,
      String orderingProviderCounty,
      String orderingProviderState,
      String orderingProviderZipCode,
      String orderingProviderTelephone,
      List<String> deviceIds,
      List<String> deviceSpecimenTypes,
      String defaultDeviceId) {
    _os.assertFacilityNameAvailable(testingFacilityName);

    DeviceSpecimenTypeHolder dstHolder =
        deviceSpecimenTypes == null
            ? _dts.getTypesForFacility(defaultDeviceId, deviceIds)
            : _dts.getDeviceSpecimenTypesForFacility(defaultDeviceId, deviceSpecimenTypes);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            Translators.parseString(orderingProviderStreet),
            Translators.parseString(orderingProviderStreetTwo),
            Translators.parseString(orderingProviderCity),
            Translators.parseState(orderingProviderState),
            Translators.parseString(orderingProviderZipCode),
            Translators.parseString(orderingProviderCounty));
    PersonName providerName =
        new PersonName(
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix);
    Facility created =
        _os.createFacility(
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            Translators.parsePhoneNumber(phone),
            Translators.parseEmail(email),
            dstHolder,
            providerName,
            providerAddress,
            orderingProviderTelephone,
            orderingProviderNPI);

    return new ApiFacility(created);
  }

  public ApiFacility updateFacility(
      UUID facilityId,
      String testingFacilityName,
      String cliaNumber,
      String street,
      String streetTwo,
      String city,
      String county,
      String state,
      String zipCode,
      String phone,
      String email,
      String orderingProviderFirstName,
      String orderingProviderMiddleName,
      String orderingProviderLastName,
      String orderingProviderSuffix,
      String orderingProviderNPI,
      String orderingProviderStreet,
      String orderingProviderStreetTwo,
      String orderingProviderCity,
      String orderingProviderCounty,
      String orderingProviderState,
      String orderingProviderZipCode,
      String orderingProviderTelephone,
      List<String> deviceIds,
      List<String> deviceSpecimenTypes,
      String defaultDeviceId) {

    DeviceSpecimenTypeHolder dstHolder =
        deviceSpecimenTypes == null
            ? _dts.getTypesForFacility(defaultDeviceId, deviceIds)
            : _dts.getDeviceSpecimenTypesForFacility(defaultDeviceId, deviceSpecimenTypes);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);

    StreetAddress providerAddress =
        new StreetAddress(
            Translators.parseString(orderingProviderStreet),
            Translators.parseString(orderingProviderStreetTwo),
            Translators.parseString(orderingProviderCity),
            Translators.parseState(orderingProviderState),
            Translators.parseString(orderingProviderZipCode),
            Translators.parseString(orderingProviderCounty));
    Facility facility =
        _os.updateFacility(
            facilityId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            Translators.parsePhoneNumber(phone),
            Translators.parseEmail(email),
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix,
            orderingProviderNPI,
            providerAddress,
            Translators.parsePhoneNumber(orderingProviderTelephone),
            dstHolder);
    return new ApiFacility(facility);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public ApiOrganization createOrganization(
      String name,
      String type,
      String externalId,
      String testingFacilityName,
      String cliaNumber,
      String street,
      String streetTwo,
      String city,
      String county,
      String state,
      String zipCode,
      String phone,
      String email,
      PersonName providerName,
      String orderingProviderFirstName,
      String orderingProviderMiddleName,
      String orderingProviderLastName,
      String orderingProviderSuffix,
      String orderingProviderNPI,
      String orderingProviderStreet,
      String orderingProviderStreetTwo,
      String orderingProviderCity,
      String orderingProviderCounty,
      String orderingProviderState,
      String orderingProviderZipCode,
      String orderingProviderTelephone,
      List<String> deviceIds,
      String defaultDeviceId,
      PersonName adminName,
      String adminFirstName,
      String adminMiddleName,
      String adminLastName,
      String adminSuffix,
      String adminEmail) {
    DeviceSpecimenTypeHolder deviceSpecimenTypes =
        _dts.getTypesForFacility(defaultDeviceId, deviceIds);
    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            Translators.parseString(orderingProviderStreet),
            Translators.parseString(orderingProviderStreetTwo),
            Translators.parseString(orderingProviderCity),
            Translators.parseState(orderingProviderState),
            Translators.parseString(orderingProviderZipCode),
            Translators.parseString(orderingProviderCounty));
    providerName = // SPECIAL CASE: MAY BE ALL NULLS/BLANKS
        Translators.consolidateNameArguments(
            providerName,
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix,
            true);
    adminName =
        Translators.consolidateNameArguments(
            adminName, adminFirstName, adminMiddleName, adminLastName, adminSuffix);
    Organization org =
        _os.createOrganizationAndFacility(
            name,
            Translators.parseOrganizationType(type),
            externalId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            Translators.parsePhoneNumber(phone),
            Translators.parseEmail(email),
            deviceSpecimenTypes,
            providerName,
            providerAddress,
            Translators.parsePhoneNumber(orderingProviderTelephone),
            orderingProviderNPI);
    _aus.createUser(adminEmail, adminName, externalId, Role.ADMIN);
    List<Facility> facilities = _os.getFacilities(org);
    return new ApiOrganization(org, facilities);
  }

  public void adminUpdateOrganization(String name, String type) {
    String parsedType = Translators.parseOrganizationType(type);
    _os.updateOrganization(name, parsedType);
  }

  public void updateOrganization(String type) {
    String parsedType = Translators.parseOrganizationType(type);
    _os.updateOrganization(parsedType);
  }

  public boolean setOrganizationIdentityVerified(String externalId, boolean verified) {
    return _os.setIdentityVerified(externalId, verified);
  }
}
