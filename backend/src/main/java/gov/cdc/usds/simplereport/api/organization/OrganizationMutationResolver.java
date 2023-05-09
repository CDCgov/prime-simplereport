package gov.cdc.usds.simplereport.api.organization;

import static gov.cdc.usds.simplereport.api.Translators.parseEmail;
import static gov.cdc.usds.simplereport.api.Translators.parseOrganizationType;
import static gov.cdc.usds.simplereport.api.Translators.parsePhoneNumber;
import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;
import static gov.cdc.usds.simplereport.api.Translators.toOptional;

import gov.cdc.usds.simplereport.api.model.AddFacilityInput;
import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.UpdateFacilityInput;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.transaction.Transactional;
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
      @Argument List<UUID> deviceIds,
      @Argument AddFacilityInput facilityInfo) {
    if (facilityInfo == null) {
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

    organizationService.assertFacilityNameAvailable(facilityInfo.getFacilityName());

    StreetAddress facilityAddress =
        addressValidationService.getValidatedAddress(
            facilityInfo.getStreet(),
            facilityInfo.getStreetTwo(),
            facilityInfo.getCity(),
            facilityInfo.getState(),
            facilityInfo.getZipCode(),
            addressValidationService.FACILITY_DISPLAY_NAME);
    StreetAddress providerAddress =
        new StreetAddress(
            parseString(facilityInfo.getOrderingProvider().getStreet()),
            parseString(facilityInfo.getOrderingProvider().getStreetTwo()),
            parseString(facilityInfo.getOrderingProvider().getCity()),
            parseState(facilityInfo.getOrderingProvider().getState()),
            parseString(facilityInfo.getOrderingProvider().getZipCode()),
            parseString(facilityInfo.getOrderingProvider().getCounty()));
    PersonName providerName =
        new PersonName(
            facilityInfo.getOrderingProvider().getFirstName(),
            facilityInfo.getOrderingProvider().getMiddleName(),
            facilityInfo.getOrderingProvider().getLastName(),
            facilityInfo.getOrderingProvider().getSuffix());
    Facility created =
        organizationService.createFacility(
            facilityInfo.getFacilityName(),
            facilityInfo.getCliaNumber(),
            facilityAddress,
            parsePhoneNumber(facilityInfo.getPhone()),
            parseEmail(facilityInfo.getEmail()),
            facilityInfo.getDeviceIds(),
            providerName,
            providerAddress,
            parsePhoneNumber(facilityInfo.getOrderingProvider().getPhone()),
            facilityInfo.getOrderingProvider().getNpi());

    return new ApiFacility(created);
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
      @Argument List<UUID> deviceIds,
      @Argument UpdateFacilityInput facilityInfo) {

    if (facilityInfo == null) {
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
    StreetAddress facilityAddress =
        addressValidationService.getValidatedAddress(
            facilityInfo.getStreet(),
            facilityInfo.getStreetTwo(),
            facilityInfo.getCity(),
            facilityInfo.getState(),
            facilityInfo.getZipCode(),
            addressValidationService.FACILITY_DISPLAY_NAME);

    PersonName providerName =
        new PersonName(
            facilityInfo.getOrderingProvider().getFirstName(),
            facilityInfo.getOrderingProvider().getMiddleName(),
            facilityInfo.getOrderingProvider().getLastName(),
            facilityInfo.getOrderingProvider().getSuffix());

    StreetAddress providerAddress =
        new StreetAddress(
            parseString(facilityInfo.getOrderingProvider().getStreet()),
            parseString(facilityInfo.getOrderingProvider().getStreetTwo()),
            parseString(facilityInfo.getOrderingProvider().getCity()),
            parseState(facilityInfo.getOrderingProvider().getState()),
            parseString(facilityInfo.getOrderingProvider().getZipCode()),
            parseString(facilityInfo.getOrderingProvider().getCounty()));
    Facility facility =
        organizationService.updateFacility(
            facilityInfo.getFacilityId(),
            facilityInfo.getFacilityName(),
            facilityInfo.getCliaNumber(),
            facilityAddress,
            parsePhoneNumber(facilityInfo.getPhone()),
            parseEmail(facilityInfo.getEmail()),
            providerName,
            providerAddress,
            facilityInfo.getOrderingProvider().getNpi(),
            parsePhoneNumber(facilityInfo.getOrderingProvider().getPhone()),
            facilityInfo.getDeviceIds());
    return new ApiFacility(facility);
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
  @Transactional
  @MutationMapping
  public Organization markOrganizationAsDeleted(
      @Argument UUID organizationId, @Argument boolean deleted) {
    Organization orgToBeUpdated = organizationService.getOrganizationById(organizationId);
    List<ApiUser> usersInOrgToBeUpdated = apiUserService.getAllUsersByOrganization(orgToBeUpdated);

    usersInOrgToBeUpdated.forEach(
        user -> apiUserService.setIsDeleted(user.getInternalId(), deleted));
    Set<Facility> facilitiesToBeUpdated =
        organizationService.getFacilitiesIncludeArchived(orgToBeUpdated, !deleted);
    facilitiesToBeUpdated.forEach(
        facility -> this.markFacilityAsDeleted(facility.getInternalId(), deleted));
    return organizationService.markOrganizationAsDeleted(orgToBeUpdated.getInternalId(), deleted);
  }

  /** Support-only mutation to mark a facility as deleted. This is a soft deletion only. */
  @MutationMapping
  public Facility markFacilityAsDeleted(@Argument UUID facilityId, @Argument boolean deleted) {
    return organizationService.markFacilityAsDeleted(facilityId, deleted);
  }
}
