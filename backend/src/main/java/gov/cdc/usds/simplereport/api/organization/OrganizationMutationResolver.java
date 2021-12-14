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
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLMutationResolver;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Created by nickrobison on 11/17/20 */
@Component
@RequiredArgsConstructor
public class OrganizationMutationResolver implements GraphQLMutationResolver {

  private final OrganizationService organizationService;
  private final OrganizationQueueService organizationQueueService;
  private final AddressValidationService addressValidationService;
  private final ApiUserService apiUserService;
  private final DeviceSpecimenTypeRepository deviceSpecimenTypeRepository;

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
      List<UUID> deviceSpecimenTypes,
      String defaultDeviceId) {

    List<UUID> deviceIdsFromDeviceSpecimenTypes =
        deviceSpecimenTypes.stream()
            .map(
                id -> {
                  return deviceSpecimenTypeRepository
                      .findById(id)
                      .map(DeviceSpecimenType::getDeviceType)
                      .map(IdentifiedEntity::getInternalId)
                      .orElse(null);
                })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    return addFacilityNew(
        testingFacilityName,
        cliaNumber,
        street,
        streetTwo,
        city,
        state,
        zipCode,
        phone,
        email,
        orderingProviderFirstName,
        orderingProviderMiddleName,
        orderingProviderLastName,
        orderingProviderSuffix,
        orderingProviderNPI,
        orderingProviderStreet,
        orderingProviderStreetTwo,
        orderingProviderCity,
        orderingProviderCounty,
        orderingProviderState,
        orderingProviderZipCode,
        orderingProviderTelephone,
        deviceIdsFromDeviceSpecimenTypes);
  }

  public ApiFacility addFacilityNew(
      String testingFacilityName,
      String cliaNumber,
      String street,
      String streetTwo,
      String city,
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
      List<UUID> deviceIds) {
    organizationService.assertFacilityNameAvailable(testingFacilityName);

    StreetAddress facilityAddress =
        addressValidationService.getValidatedAddress(
            street,
            streetTwo,
            city,
            state,
            zipCode,
            addressValidationService.FACILITY_DISPLAY_NAME);
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
        organizationService.createFacility(
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            parsePhoneNumber(phone),
            parseEmail(email),
            deviceIds,
            providerName,
            providerAddress,
            parsePhoneNumber(orderingProviderTelephone),
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
      List<UUID> deviceSpecimenTypes,
      String defaultDeviceId) {

    List<UUID> deviceIdsFromDeviceSpecimenTypes =
        deviceSpecimenTypes.stream()
            .map(
                id -> {
                  return deviceSpecimenTypeRepository
                      .findById(id)
                      .map(DeviceSpecimenType::getDeviceType)
                      .map(IdentifiedEntity::getInternalId)
                      .orElse(null);
                })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

    return updateFacilityNew(
        facilityId,
        testingFacilityName,
        cliaNumber,
        street,
        streetTwo,
        city,
        state,
        zipCode,
        phone,
        email,
        orderingProviderFirstName,
        orderingProviderMiddleName,
        orderingProviderLastName,
        orderingProviderSuffix,
        orderingProviderNPI,
        orderingProviderStreet,
        orderingProviderStreetTwo,
        orderingProviderCity,
        orderingProviderCounty,
        orderingProviderState,
        orderingProviderZipCode,
        orderingProviderTelephone,
        deviceIdsFromDeviceSpecimenTypes);
  }

  public ApiFacility updateFacilityNew(
      UUID facilityId,
      String testingFacilityName,
      String cliaNumber,
      String street,
      String streetTwo,
      String city,
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
      List<UUID> deviceIds) {

    StreetAddress facilityAddress =
        addressValidationService.getValidatedAddress(
            street,
            streetTwo,
            city,
            state,
            zipCode,
            addressValidationService.FACILITY_DISPLAY_NAME);

    PersonName providerName =
        new PersonName(
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderLastName,
            orderingProviderSuffix);

    StreetAddress providerAddress =
        new StreetAddress(
            parseString(orderingProviderStreet),
            parseString(orderingProviderStreetTwo),
            parseString(orderingProviderCity),
            parseState(orderingProviderState),
            parseString(orderingProviderZipCode),
            parseString(orderingProviderCounty));
    Facility facility =
        organizationService.updateFacility(
            facilityId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            parsePhoneNumber(phone),
            parseEmail(email),
            providerName,
            providerAddress,
            orderingProviderNPI,
            parsePhoneNumber(orderingProviderTelephone),
            deviceIds);
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

    List<UUID> deviceInternalIds =
        deviceIds.stream().map(UUID::fromString).collect(Collectors.toList());

    StreetAddress facilityAddress =
        addressValidationService.getValidatedAddress(
            street,
            streetTwo,
            city,
            state,
            zipCode,
            addressValidationService.FACILITY_DISPLAY_NAME);
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
        organizationService.createOrganizationAndFacility(
            name,
            parseOrganizationType(type),
            externalId,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            parsePhoneNumber(phone),
            parseEmail(email),
            deviceInternalIds,
            providerName,
            providerAddress,
            parsePhoneNumber(orderingProviderTelephone),
            orderingProviderNPI);
    apiUserService.createUser(adminEmail, adminName, externalId, Role.ADMIN);
    List<Facility> facilities = organizationService.getFacilities(org);
    return new ApiOrganization(org, facilities);
  }

  public void adminUpdateOrganization(String name, String type) {
    String parsedType = parseOrganizationType(type);
    organizationService.updateOrganization(name, parsedType);
  }

  public void updateOrganization(String type) {
    String parsedType = parseOrganizationType(type);
    organizationService.updateOrganization(parsedType);
  }

  public boolean setOrganizationIdentityVerified(String externalId, boolean verified) {
    Optional<OrganizationQueueItem> orgQueueItem =
        organizationQueueService.getUnverifiedQueuedOrganizationByExternalId(externalId);
    if (orgQueueItem.isPresent() && verified) {
      organizationQueueService.createAndActivateQueuedOrganization(orgQueueItem.get());
    }
    return organizationService.setIdentityVerified(externalId, verified);
  }

  public String editPendingOrganization(
      String orgExternalId,
      String name,
      String adminFirstName,
      String adminLastName,
      String adminEmail,
      String adminPhone) {
    OrganizationQueueItem editedItem =
        organizationQueueService.editQueueItem(
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
    return organizationService.markFacilityAsDeleted(facilityId, deleted);
  }
}
