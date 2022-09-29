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
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

/** Created by nickrobison on 11/17/20 */
@Controller
@RequiredArgsConstructor
public class OrganizationMutationResolver {

  private final OrganizationService organizationService;
  private final OrganizationQueueService organizationQueueService;
  private final AddressValidationService addressValidationService;
  private final ApiUserService apiUserService;

  /** addFacility is the latest iteration */
  /** remove addFacilityNew at a later date */
  @MutationMapping
  public ApiFacility addFacility(
      @Argument String testingFacilityName,
      @Argument String cliaNumber,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String phone,
      @Argument String email,
      @Argument String orderingProviderFirstName,
      @Argument String orderingProviderMiddleName,
      @Argument String orderingProviderLastName,
      @Argument String orderingProviderSuffix,
      @Argument String orderingProviderNPI,
      @Argument String orderingProviderStreet,
      @Argument String orderingProviderStreetTwo,
      @Argument String orderingProviderCity,
      @Argument String orderingProviderCounty,
      @Argument String orderingProviderState,
      @Argument String orderingProviderZipCode,
      @Argument String orderingProviderPhone,
      @Argument List<UUID> deviceIds) {
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
            parsePhoneNumber(orderingProviderPhone),
            orderingProviderNPI);

    return new ApiFacility(created);
  }

  /** addFacilityNew is being kept along side addFacility to ensure backwards compatibility */
  /** addFacilityNew calls addFacility */
  /** addFacilityNew should be removed at a future date */
  @MutationMapping
  public ApiFacility addFacilityNew(
      @Argument String testingFacilityName,
      @Argument String cliaNumber,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String phone,
      @Argument String email,
      @Argument String orderingProviderFirstName,
      @Argument String orderingProviderMiddleName,
      @Argument String orderingProviderLastName,
      @Argument String orderingProviderSuffix,
      @Argument String orderingProviderNPI,
      @Argument String orderingProviderStreet,
      @Argument String orderingProviderStreetTwo,
      @Argument String orderingProviderCity,
      @Argument String orderingProviderCounty,
      @Argument String orderingProviderState,
      @Argument String orderingProviderZipCode,
      @Argument String orderingProviderPhone,
      @Argument List<UUID> deviceIds) {

    return addFacility(
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
        orderingProviderPhone,
        deviceIds);
  }

  /** updateFacility is the latest iteration */
  /** remove updateFacilityNew at a later date */
  @MutationMapping
  public ApiFacility updateFacility(
      @Argument UUID facilityId,
      @Argument String testingFacilityName,
      @Argument String cliaNumber,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String phone,
      @Argument String email,
      @Argument String orderingProviderFirstName,
      @Argument String orderingProviderMiddleName,
      @Argument String orderingProviderLastName,
      @Argument String orderingProviderSuffix,
      @Argument String orderingProviderNPI,
      @Argument String orderingProviderStreet,
      @Argument String orderingProviderStreetTwo,
      @Argument String orderingProviderCity,
      @Argument String orderingProviderCounty,
      @Argument String orderingProviderState,
      @Argument String orderingProviderZipCode,
      @Argument String orderingProviderPhone,
      @Argument List<UUID> deviceIds) {

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
            parsePhoneNumber(orderingProviderPhone),
            deviceIds);
    return new ApiFacility(facility);
  }

  /** updateFacilityNew is being kept along side updateFacility to ensure backwards compatibility */
  /** updateFacilityNew calls updateFacility */
  /** updateFacilityNew should be removed at a future date */
  @MutationMapping
  public ApiFacility updateFacilityNew(
      @Argument UUID facilityId,
      @Argument String testingFacilityName,
      @Argument String cliaNumber,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String state,
      @Argument String zipCode,
      @Argument String phone,
      @Argument String email,
      @Argument String orderingProviderFirstName,
      @Argument String orderingProviderMiddleName,
      @Argument String orderingProviderLastName,
      @Argument String orderingProviderSuffix,
      @Argument String orderingProviderNPI,
      @Argument String orderingProviderStreet,
      @Argument String orderingProviderStreetTwo,
      @Argument String orderingProviderCity,
      @Argument String orderingProviderCounty,
      @Argument String orderingProviderState,
      @Argument String orderingProviderZipCode,
      @Argument String orderingProviderPhone,
      @Argument List<UUID> deviceIds) {

    return updateFacility(
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
        orderingProviderPhone,
        deviceIds);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @MutationMapping
  public ApiOrganization createOrganization(
      @Argument String name,
      @Argument String type,
      @Argument String externalId,
      @Argument String testingFacilityName,
      @Argument String cliaNumber,
      @Argument String street,
      @Argument String streetTwo,
      @Argument String city,
      @Argument String county,
      @Argument String state,
      @Argument String zipCode,
      @Argument String phone,
      @Argument String email,
      @Argument PersonName orderingProviderName,
      @Argument String orderingProviderFirstName,
      @Argument String orderingProviderMiddleName,
      @Argument String orderingProviderLastName,
      @Argument String orderingProviderSuffix,
      @Argument String orderingProviderNPI,
      @Argument String orderingProviderStreet,
      @Argument String orderingProviderStreetTwo,
      @Argument String orderingProviderCity,
      @Argument String orderingProviderCounty,
      @Argument String orderingProviderState,
      @Argument String orderingProviderZipCode,
      @Argument String orderingProviderPhone,
      @Argument List<String> deviceTypes,
      @Argument String defaultDevice,
      @Argument PersonName adminName,
      @Argument String adminFirstName,
      @Argument String adminMiddleName,
      @Argument String adminLastName,
      @Argument String adminSuffix,
      @Argument String adminEmail) {

    List<UUID> deviceInternalIds = Collections.emptyList();

    if (deviceTypes != null) {
      deviceInternalIds = deviceTypes.stream().map(UUID::fromString).collect(Collectors.toList());
    }

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
    orderingProviderName = // SPECIAL CASE: MAY BE ALL NULLS/BLANKS
        consolidateNameArguments(
            orderingProviderName,
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
            orderingProviderName,
            providerAddress,
            parsePhoneNumber(orderingProviderPhone),
            orderingProviderNPI);
    apiUserService.createUser(adminEmail, adminName, externalId, Role.ADMIN);
    List<Facility> facilities = organizationService.getFacilities(org);
    return new ApiOrganization(org, facilities);
  }

  @MutationMapping
  public void adminUpdateOrganization(@Argument String name, @Argument String type) {
    String parsedType = parseOrganizationType(type);
    organizationService.updateOrganization(name, parsedType);
  }

  @MutationMapping
  public void updateOrganization(@Argument String type) {
    String parsedType = parseOrganizationType(type);
    organizationService.updateOrganization(parsedType);
  }

  @MutationMapping
  public boolean setOrganizationIdentityVerified(
      @Argument String externalId, @Argument boolean verified) {
    Optional<OrganizationQueueItem> orgQueueItem =
        organizationQueueService.getUnverifiedQueuedOrganizationByExternalId(externalId);
    if (orgQueueItem.isPresent() && verified) {
      organizationQueueService.createAndActivateQueuedOrganization(orgQueueItem.get());
    }
    return organizationService.setIdentityVerified(externalId, verified);
  }

  @MutationMapping
  public String editPendingOrganization(
      @Argument String orgExternalId,
      @Argument String name,
      @Argument String adminFirstName,
      @Argument String adminLastName,
      @Argument String adminEmail,
      @Argument String adminPhone) {
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

  /**
   * Support-only mutation to mark a PendingOrganization as deleted. This is a soft deletion only.
   */
  @MutationMapping
  public OrganizationQueueItem markPendingOrganizationAsDeleted(
      @Argument String orgExternalId, @Argument boolean deleted) {
    return organizationQueueService.markPendingOrganizationAsDeleted(orgExternalId, deleted);
  }

  /** Support-only mutation to mark an organization as deleted. This is a soft deletion only. */
  @MutationMapping
  public Organization markOrganizationAsDeleted(
      @Argument UUID organizationId, @Argument boolean deleted) {
    return organizationService.markOrganizationAsDeleted(organizationId, deleted);
  }

  /** Support-only mutation to mark a facility as deleted. This is a soft deletion only. */
  @MutationMapping
  public Facility markFacilityAsDeleted(@Argument UUID facilityId, @Argument boolean deleted) {
    return organizationService.markFacilityAsDeleted(facilityId, deleted);
  }
}
