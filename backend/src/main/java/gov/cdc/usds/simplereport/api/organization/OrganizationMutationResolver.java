package gov.cdc.usds.simplereport.api.organization;

import static gov.cdc.usds.simplereport.api.Translators.consolidateNameArguments;
import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseOrganizationType;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.toOptional;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
public class OrganizationMutationResolver implements GraphQLMutationResolver {

  private final OrganizationService _os;
  private final OrganizationQueueService _oqs;
  private final DeviceTypeService _dts;
  private final AddressValidationService _avs;
  private final ApiUserService _aus;

  public OrganizationMutationResolver(
      OrganizationService os,
      OrganizationQueueService oqs,
      DeviceTypeService dts,
      AddressValidationService avs,
      ApiUserService aus) {
    _os = os;
    _oqs = oqs;
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
      List<String> deviceIds) {
    _os.assertFacilityNameAvailable(testingFacilityName);

    // For historical reasons, entities representing the internal database ID of a device type
    // may be typed in the GraphQL schema as a String instead of an ID.
    // Standardize on the UUID type for these IDs downstream of the mutation
    List<UUID> deviceInternalIds =
        deviceIds.stream().map(UUID::fromString).collect(Collectors.toList());
    List<DeviceType> devices = _dts.getDeviceTypesByIds(deviceInternalIds);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            parseString(orderingProviderStreet),
            parseString(orderingProviderStreetTwo),
            parseString(orderingProviderCity),
            parseState(orderingProviderState),
            parseString(orderingProviderZipCode),
            parseString(orderingProviderCounty));
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
            parsePhoneNumber(phone),
            parseEmail(email),
            devices,
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
      List<String> deviceIds) {
    // For historical reasons, entities representing the internal database ID of a device type
    // may be typed in the GraphQL schema as a String instead of an ID.
    // Standardize on the UUID type for these IDs downstream of the mutation
    List<UUID> deviceInternalIds =
        deviceIds.stream().map(UUID::fromString).collect(Collectors.toList());
    List<DeviceType> devices = _dts.getDeviceTypesByIds(deviceInternalIds);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);

    StreetAddress providerAddress =
        new StreetAddress(
            parseString(orderingProviderStreet),
            parseString(orderingProviderStreetTwo),
            parseString(orderingProviderCity),
            parseState(orderingProviderState),
            parseString(orderingProviderZipCode),
            parseString(orderingProviderCounty));
    Facility facility =
        _os.updateFacility(
            facilityId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            parsePhoneNumber(phone),
            parseEmail(email),
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix,
            orderingProviderNPI,
            providerAddress,
            parsePhoneNumber(orderingProviderTelephone),
            devices);
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
      // String defaultDeviceId,
      PersonName adminName,
      String adminFirstName,
      String adminMiddleName,
      String adminLastName,
      String adminSuffix,
      String adminEmail) {

    List<UUID> deviceInternalIds =
        deviceIds.stream().map(UUID::fromString).collect(Collectors.toList());
    List<DeviceType> devices = _dts.getDeviceTypesByIds(deviceInternalIds);

    StreetAddress facilityAddress =
        _avs.getValidatedAddress(
            street, streetTwo, city, state, zipCode, _avs.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            parseString(orderingProviderStreet),
            parseString(orderingProviderStreetTwo),
            parseString(orderingProviderCity),
            parseState(orderingProviderState),
            parseString(orderingProviderZipCode),
            parseString(orderingProviderCounty));
    providerName = // SPECIAL CASE: MAY BE ALL NULLS/BLANKS
        consolidateNameArguments(
            providerName,
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix,
            true);
    adminName =
        consolidateNameArguments(
            adminName, adminFirstName, adminMiddleName, adminLastName, adminSuffix);
    Organization org =
        _os.createOrganizationAndFacility(
            name,
            parseOrganizationType(type),
            externalId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            parsePhoneNumber(phone),
            parseEmail(email),
            devices,
            providerName,
            providerAddress,
            parsePhoneNumber(orderingProviderTelephone),
            orderingProviderNPI);
    _aus.createUser(adminEmail, adminName, externalId, Role.ADMIN);
    List<Facility> facilities = _os.getFacilities(org);
    return new ApiOrganization(org, facilities);
  }

  public void adminUpdateOrganization(String name, String type) {
    String parsedType = parseOrganizationType(type);
    _os.updateOrganization(name, parsedType);
  }

  public void updateOrganization(String type) {
    String parsedType = parseOrganizationType(type);
    _os.updateOrganization(parsedType);
  }

  public boolean setOrganizationIdentityVerified(String externalId, boolean verified) {
    Optional<OrganizationQueueItem> orgQueueItem =
        _oqs.getUnverifiedQueuedOrganizationByExternalId(externalId);
    if (orgQueueItem.isPresent() && verified) {
      _oqs.createAndActivateQueuedOrganization(orgQueueItem.get());
    }
    return _os.setIdentityVerified(externalId, verified);
  }

  public String editPendingOrganization(
      String orgExternalId,
      String name,
      String adminFirstName,
      String adminLastName,
      String adminEmail,
      String adminPhone) {
    OrganizationQueueItem editedItem =
        _oqs.editQueueItem(
            orgExternalId,
            toOptional(name),
            toOptional(adminFirstName),
            toOptional(adminLastName),
            toOptional(adminEmail),
            toOptional(adminPhone));
    return editedItem.getExternalId();
  }

  /** Support-only mutation to mark a facility as deleted. This is a soft deletion only. */
  public Facility markFacilityAsDeleted(UUID facilityId, boolean deleted) {
    return _os.markFacilityAsDeleted(facilityId, deleted);
  }
}
