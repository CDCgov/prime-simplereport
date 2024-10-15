package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.CurrentOrganizationRolesContextHolder;
import gov.cdc.usds.simplereport.api.model.FacilityStats;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentOrgException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.FacilityBuilder;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.validators.OrderingProviderRequiredValidator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.ListUtils;
import org.springframework.beans.factory.support.ScopeNotActiveException;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
@RequiredArgsConstructor
public class OrganizationService {
  private final ApiUserRepository apiUserRepository;

  private final OrganizationRepository organizationRepository;
  private final FacilityRepository facilityRepository;
  private final ProviderRepository providerRepository;
  private final PersonRepository personRepository;
  private final OktaRepository oktaRepository;
  private final CurrentOrganizationRolesContextHolder organizationRolesContext;
  private final OrderingProviderRequiredValidator orderingProviderValidator;
  private final AuthorizationService authorizationService;
  private final DbAuthorizationService dbAuthorizationService;
  private final PatientSelfRegistrationLinkService patientSelfRegistrationLinkService;
  private final DeviceTypeRepository deviceTypeRepository;
  private final EmailService emailService;
  private final FeatureFlagsConfig featureFlagsConfig;

  public void resetOrganizationRolesContext() {
    organizationRolesContext.reset();
  }

  public Optional<OrganizationRoles> getCurrentOrganizationRoles() {
    try {
      if (organizationRolesContext.hasBeenPopulated()) {
        return organizationRolesContext.getOrganizationRoles();
      }
      var result = fetchCurrentOrganizationRoles();
      organizationRolesContext.setOrganizationRoles(result);
      return result;
    } catch (ScopeNotActiveException e) {
      return fetchCurrentOrganizationRoles();
    }
  }

  private Optional<OrganizationRoles> fetchCurrentOrganizationRoles() {
    List<OrganizationRoleClaims> orgRoles = authorizationService.findAllOrganizationRoles();
    List<String> candidateExternalIds =
        orgRoles.stream()
            .map(OrganizationRoleClaims::getOrganizationExternalId)
            .collect(Collectors.toList());
    List<Organization> validOrgs = organizationRepository.findAllByExternalId(candidateExternalIds);
    if (validOrgs == null || validOrgs.size() != 1) {
      int numOrgs = (validOrgs == null) ? 0 : validOrgs.size();
      log.warn("Found {} organizations for user", numOrgs);
      return Optional.empty();
    }
    Organization foundOrg = validOrgs.get(0);
    Optional<OrganizationRoleClaims> foundRoles =
        orgRoles.stream()
            .filter(r -> r.getOrganizationExternalId().equals(foundOrg.getExternalId()))
            .findFirst();
    return foundRoles.map(r -> getOrganizationRoles(foundOrg, r));
  }

  public Set<Facility> getAccessibleFacilities() {
    Optional<OrganizationRoles> roles = getCurrentOrganizationRoles();
    return roles.isPresent() ? roles.get().getFacilities() : Set.of();
  }

  public Organization getCurrentOrganization() {
    OrganizationRoles orgRole =
        getCurrentOrganizationRoles().orElseThrow(MisconfiguredUserException::new);
    return orgRole.getOrganization();
  }

  /**
   * This method exists because we need to bypass the request-context level cache in test setups,
   * which do not <em>have</em> a request context.
   *
   * <p><strong>In request-level code, use getCurrentOrganization instead</strong>
   */
  public Organization getCurrentOrganizationNoCache() {
    OrganizationRoles orgRole =
        fetchCurrentOrganizationRoles().orElseThrow(MisconfiguredUserException::new);
    return orgRole.getOrganization();
  }

  public OrganizationRoles getOrganizationRoles(OrganizationRoleClaims roleClaims) {
    Organization org = getOrganization(roleClaims.getOrganizationExternalId());
    return getOrganizationRoles(org, roleClaims);
  }

  public OrganizationRoles getOrganizationRoles(
      Organization org, OrganizationRoleClaims roleClaims) {
    return new OrganizationRoles(
        org, getAccessibleFacilities(org, roleClaims), roleClaims.getGrantedRoles());
  }

  public Organization getOrganization(String externalId) {
    Optional<Organization> found = organizationRepository.findByExternalId(externalId);
    return found.orElseThrow(
        () ->
            new IllegalGraphqlArgumentException(
                "An organization with external_id=" + externalId + " does not exist"));
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Organization getOrganizationWithExternalIdAsSiteAdmin(String externalId) {
    return getOrganization(externalId);
  }

  public Organization getOrganizationById(UUID internalId) {
    Optional<Organization> found = organizationRepository.findById(internalId);
    return found.orElseThrow(
        () ->
            new IllegalGraphqlArgumentException(
                "An organization with internal_id=" + internalId + " does not exist"));
  }

  public List<Organization> getOrganizationsByName(String name) {
    return organizationRepository.findAllByName(name);
  }

  public List<Organization> getOrganizationsByName(String name, Boolean isDeleted) {
    return organizationRepository.findAllByNameAndDeleted(name, isDeleted);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<Organization> getOrganizations(Boolean identityVerified) {
    return identityVerified == null
        ? organizationRepository.findAll()
        : organizationRepository.findAllByIdentityVerified(identityVerified);
  }

  public Set<Facility> getAccessibleFacilities(
      Organization org, OrganizationRoleClaims roleClaims) {
    // If there are no facility restrictions, get all facilities in org; otherwise,
    // get specified
    // list.
    return roleClaims.grantsAllFacilityAccess()
        ? facilityRepository.findAllByOrganization(org)
        : facilityRepository.findAllByOrganizationAndInternalId(org, roleClaims.getFacilities());
  }

  public List<Facility> getFacilities(Organization org) {
    return facilityRepository.findByOrganizationOrderByFacilityName(org);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Set<Facility> getFacilitiesIncludeArchived(Organization org, Boolean includeArchived) {
    return facilityRepository.findAllByOrganizationAndDeleted(org, includeArchived);
  }

  public Set<Facility> getFacilities(Organization org, Collection<UUID> facilityIds) {
    return facilityRepository.findAllByOrganizationAndInternalId(org, facilityIds);
  }

  @AuthorizationConfiguration.RequirePermissionViewArchivedFacilities
  public Set<Facility> getArchivedFacilities(Organization org) {
    return facilityRepository.findAllByOrganizationAndDeleted(org, true);
  }

  @AuthorizationConfiguration.RequirePermissionViewArchivedFacilities
  public Set<Facility> getArchivedFacilities() {
    Organization org = getCurrentOrganization();
    return getArchivedFacilities(org);
  }

  public Facility getFacilityInCurrentOrg(UUID facilityId) {
    return getCurrentOrganizationRoles()
        .orElseThrow(MisconfiguredUserException::new)
        .getFacilities()
        .stream()
        .filter(f -> f.getInternalId().equals(facilityId))
        .findAny()
        .orElseThrow(() -> new IllegalGraphqlArgumentException("facility could not be found"));
  }

  // clean up? 0 uses and logic seems to be mimicked in getFacilityById on 229
  public Organization getOrganizationByFacilityId(UUID facilityId) {
    Facility facility = facilityRepository.findById(facilityId).orElse(null);

    if (facility == null) {
      return null;
    }

    return facility.getOrganization();
  }

  public Optional<Facility> getFacilityById(UUID facilityId) {
    return facilityRepository.findById(facilityId);
  }

  public void assertFacilityNameAvailable(String testingFacilityName) {
    Organization org = getCurrentOrganization();
    facilityRepository
        .findByOrganizationAndFacilityName(org, testingFacilityName)
        .ifPresent(
            f -> {
              throw new IllegalGraphqlArgumentException("A facility with that name already exists");
            });
  }

  /// Update here
  // contract slightly different than factory builder in facility.java, explore why
  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequirePermissionEditFacility
  public Facility updateFacility(
      UUID facilityId,
      String testingFacilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      PersonName orderingProviderName,
      StreetAddress orderingProviderAddress,
      String orderingProviderNPI,
      String orderingProviderTelephone,
      List<UUID> orderingProviderIds,
      List<UUID> deviceIds) {

    Facility facility = this.getFacilityInCurrentOrg(facilityId);
    facility.setFacilityName(testingFacilityName);
    facility.setCliaNumber(cliaNumber);
    facility.setTelephone(phone);
    facility.setEmail(email);
    facility.setAddress(facilityAddress);

    Provider p = facility.getOrderingProvider();
    p.getNameInfo().setFirstName(orderingProviderName.getFirstName());
    p.getNameInfo().setMiddleName(orderingProviderName.getMiddleName());
    p.getNameInfo().setLastName(orderingProviderName.getLastName());
    p.getNameInfo().setSuffix(orderingProviderName.getSuffix());
    p.setProviderId(orderingProviderNPI);
    p.setTelephone(orderingProviderTelephone);
    p.setAddress(orderingProviderAddress);

    orderingProviderValidator.assertValidity(
        p.getNameInfo(), p.getProviderId(), p.getTelephone(), facility.getAddress().getState());

    // Why wipe facility of all devices?
    facility.getDeviceTypes().forEach(facility::removeDeviceType);

    // pattern to follow for MOP
    deviceIds.stream()
        .map(deviceTypeRepository::findById)
        .forEach(deviceTypeOptional -> deviceTypeOptional.ifPresent(facility::addDeviceType));

    facility.getOrderingProviders().forEach(facility::removeOrderingProvider);

    orderingProviderIds.stream()
        .map(providerRepository::findById)
        .forEach(providerOptional -> providerOptional.ifPresent(facility::addOrderingProvider));

    return facilityRepository.save(facility);
  }

  // update here
  @Transactional(readOnly = false)
  public Organization createOrganizationAndFacility(
      String name,
      String type,
      String externalId,
      String testingFacilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      List<UUID> deviceTypeIds,
      PersonName providerName,
      StreetAddress providerAddress,
      String providerTelephone,
      String providerNPI) {
    // for now, all new organizations have identity_verified = false by default
    Organization org = createOrganization(name, type, externalId);
    createFacilityNoPermissions(
        org,
        testingFacilityName,
        cliaNumber,
        facilityAddress,
        phone,
        email,
        deviceTypeIds,
        providerName,
        providerAddress,
        providerTelephone,
        providerNPI);
    return org;
  }

  @Transactional(readOnly = false)
  public Organization createOrganization(String name, String type, String externalId) {
    // for now, all new organizations have identity_verified = false by default
    Organization org = organizationRepository.save(new Organization(name, type, externalId, false));
    oktaRepository.createOrganization(org);
    patientSelfRegistrationLinkService.createRegistrationLink(org);
    return org;
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Organization updateOrganization(String name, String type) {
    Organization org = getCurrentOrganization();
    org.setOrganizationName(name);
    org.setOrganizationType(type);
    return organizationRepository.save(org);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequirePermissionEditOrganization
  public Organization updateOrganization(String type) {
    Organization org = getCurrentOrganization();
    org.setOrganizationType(type);
    return organizationRepository.save(org);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean setIdentityVerified(String externalId, boolean verified) {
    Organization org = getOrganization(externalId);
    boolean oldStatus = org.getIdentityVerified();
    org.setIdentityVerified(verified);
    boolean newStatus = organizationRepository.save(org).getIdentityVerified();
    if (oldStatus == false && newStatus == true) {
      if (featureFlagsConfig.isOktaMigrationEnabled()) {
        List<ApiUser> orgAdmins = dbAuthorizationService.getOrgAdminUsers(org);
        for (ApiUser orgAdmin : orgAdmins) {
          oktaRepository.activateUser(orgAdmin.getLoginEmail());
        }
      } else {
        oktaRepository.activateOrganization(org);
      }
    }
    return newStatus;
  }

  /**
   * This method is for verifying an organization after the Experian identity verification process.
   * It should not be used for any other purpose and once we move to the updated account request
   * workflow this should be removed.
   */
  @Transactional(readOnly = false)
  public String verifyOrganizationNoPermissions(String externalId) {
    Organization org = getOrganization(externalId);
    if (org.getIdentityVerified()) {
      throw new IllegalStateException("Organization is already verified.");
    }
    org.setIdentityVerified(true);
    organizationRepository.save(org);
    if (featureFlagsConfig.isOktaMigrationEnabled()) {
      Optional<ApiUser> orgAdmin =
          dbAuthorizationService.getOrgAdminUsers(org).stream().findFirst();

      if (orgAdmin.isPresent()) {
        String orgAdminEmail = orgAdmin.get().getLoginEmail();
        return oktaRepository.activateUser(orgAdminEmail);
      } else {
        throw new IllegalStateException("Organization does not have any org admins.");
      }
    } else {
      return oktaRepository.activateOrganizationWithSingleUser(org);
    }
  }

  // update
  private Facility createFacilityNoPermissions(
      Organization organization,
      String testingFacilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      List<UUID> deviceIds,
      PersonName providerName,
      StreetAddress providerAddress,
      String providerTelephone,
      String providerNPI) {
    orderingProviderValidator.assertValidity(
        providerName, providerNPI, providerTelephone, facilityAddress.getState());
    Provider orderingProvider =
        providerRepository.save(
            new Provider(providerName, providerNPI, providerAddress, providerTelephone));

    List<DeviceType> configuredDevices = new ArrayList<>();
    deviceIds.stream()
        .map(deviceTypeRepository::findById)
        .forEach(deviceTypeOptional -> deviceTypeOptional.ifPresent(configuredDevices::add));

    Facility facility =
        new Facility(
            FacilityBuilder.builder()
                .org(organization)
                .facilityName(testingFacilityName)
                .cliaNumber(cliaNumber)
                .facilityAddress(facilityAddress)
                .phone(phone)
                .email(email)
                .orderingProvider(orderingProvider)
                .configuredDevices(configuredDevices)
                .build());
    facility = facilityRepository.save(facility);
    patientSelfRegistrationLinkService.createRegistrationLink(facility);
    oktaRepository.createFacility(facility);
    return facility;
  }

  // update
  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequirePermissionEditFacility
  public Facility createFacility(
      String testingFacilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      List<UUID> deviceIds,
      PersonName providerName,
      StreetAddress providerAddress,
      String providerTelephone,
      String providerNPI,
      PersonName primaryProviderName,
      StreetAddress primaryProviderAddress,
      String primaryProviderTelephone,
      String primaryProviderNPI) {
    return createFacilityNoPermissions(
        getCurrentOrganization(),
        testingFacilityName,
        cliaNumber,
        facilityAddress,
        phone,
        email,
        deviceIds,
        providerName,
        providerAddress,
        providerTelephone,
        providerNPI);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Facility markFacilityAsDeleted(UUID facilityId, boolean deleted) {
    Optional<Facility> optionalFacility = facilityRepository.findById(facilityId);
    Facility facility =
        optionalFacility.orElseThrow(
            () -> new IllegalGraphqlArgumentException("Facility not found."));
    facility.setIsDeleted(deleted);
    return facilityRepository.save(facility);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Organization markOrganizationAsDeleted(UUID organizationId, boolean deleted) {
    Optional<Organization> optionalOrganization = organizationRepository.findById(organizationId);
    if (optionalOrganization.isEmpty()) {
      throw new IllegalGraphqlArgumentException("Organization not found.");
    }

    Organization organization = optionalOrganization.get();
    organization.setIsDeleted(deleted);
    return organizationRepository.save(organization);
  }

  // Maybe update?
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public FacilityStats getFacilityStats(@Argument UUID facilityId) {
    if (facilityId == null) {
      throw new IllegalGraphqlArgumentException("facilityId cannot be empty.");
    }

    Facility facility =
        this.getFacilityById(facilityId)
            .orElseThrow(() -> new IllegalGraphqlArgumentException("Facility not found."));

    Integer usersWithSingleFacilityAccess;
    if (featureFlagsConfig.isOktaMigrationEnabled()) {
      usersWithSingleFacilityAccess =
          dbAuthorizationService.getUsersWithSingleFacilityAccessCount(facility);
    } else {
      usersWithSingleFacilityAccess = this.oktaRepository.getUsersInSingleFacility(facility);
    }
    return FacilityStats.builder()
        .usersSingleAccessCount(usersWithSingleFacilityAccess)
        .patientsSingleAccessCount(
            this.personRepository.countByFacilityAndIsDeleted(facility, false))
        .build();
  }

  @AuthorizationConfiguration.RequirePermissionToAccessOrg
  public UUID getPermissibleOrgId(UUID orgId) {
    return orgId != null ? orgId : getCurrentOrganization().getInternalId();
  }

  private List<ApiUser> getOrgAdminUsers(UUID orgId) {
    Organization org = organizationRepository.findById(orgId).orElse(null);
    if (org == null) {
      log.warn(String.format("Organization with internal id %s not found", orgId));
      return List.of();
    }
    List<ApiUser> adminUsers;

    if (featureFlagsConfig.isOktaMigrationEnabled()) {
      adminUsers = dbAuthorizationService.getOrgAdminUsers(org);
    } else {
      List<String> adminUserEmails = oktaRepository.fetchAdminUserEmail(org);
      adminUsers =
          adminUserEmails.stream()
              .map(
                  adminUserEmail -> {
                    Optional<ApiUser> foundUser =
                        apiUserRepository.findByLoginEmail(adminUserEmail);
                    if (foundUser.isEmpty()) {
                      log.warn(
                          "Query for admin users in organization "
                              + org.getInternalId()
                              + " found a user in Okta but not in the database. Skipping...");
                    }
                    return foundUser.orElse(null);
                  })
              .filter(Objects::nonNull)
              .collect(Collectors.toList());
    }
    return adminUsers;
  }

  private List<String> getOrgAdminUserEmails(UUID orgId) {
    return getOrgAdminUsers(orgId).stream()
        .map(ApiUser::getLoginEmail)
        .collect(Collectors.toList());
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<UUID> getOrgAdminUserIds(UUID orgId) {
    return getOrgAdminUsers(orgId).stream()
        .map(ApiUser::getInternalId)
        .collect(Collectors.toList());
  }

  @Async
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public CompletableFuture<List<String>> sendOrgAdminEmailCSVAsync(
      List<UUID> orgInternalIds, String type, String state) {
    List<List<UUID>> partitionedOrgIds =
        ListUtils.partition(orgInternalIds, oktaRepository.getOktaOrgsLimit());
    ArrayList<String> allAdminEmails = new ArrayList<>();
    return CompletableFuture.supplyAsync(
        () -> {
          for (List<UUID> orgIds : partitionedOrgIds) {
            List<String> adminEmails =
                orgIds.stream()
                    .map(this::getOrgAdminUserEmails)
                    .flatMap(List::stream)
                    .collect(Collectors.toList());
            allAdminEmails.addAll(adminEmails);
            try {
              Thread.sleep(oktaRepository.getOktaRateLimitSleepMs());
            } catch (InterruptedException e) {
              Thread.currentThread().interrupt();
            }
          }
          List<String> sortedEmails = allAdminEmails.stream().sorted().collect(Collectors.toList());
          emailService.sendWithCSVAttachment(sortedEmails, state, type);
          return sortedEmails;
        });
  }

  private List<UUID> getOrgIdsForAdminEmailCSV(String type, String state) {
    if ("facilities".equalsIgnoreCase(type)) {
      List<Facility> facilitiesInState = facilityRepository.findByFacilityState(state);
      return facilitiesInState.stream()
          .map(f -> f.getOrganization().getInternalId())
          .distinct()
          .collect(Collectors.toList());
    }
    if ("patients".equalsIgnoreCase(type)) {
      List<Organization> orgs = organizationRepository.findAllByPatientStateWithTestEvents(state);
      return orgs.stream().map(o -> o.getInternalId()).distinct().collect(Collectors.toList());
    }
    return List.of();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean sendOrgAdminEmailCSV(String type, String state) {
    List<UUID> orgInternalIds = getOrgIdsForAdminEmailCSV(type, state);
    sendOrgAdminEmailCSVAsync(orgInternalIds, type, state);
    return true;
  }

  /**
   * Method HARD DELETES an Okta group without touching any of the application organization data.
   * SHOULD ONLY BE USED TO CLEAN UP ORGS CREATED IN OKTA FOR E2E TESTS. DON'T USE THIS METHOD FOR
   * ANY LIVE OKTA API CALLS
   */
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Organization deleteE2EOktaOrganization(String orgExternalId) {
    Organization orgToDelete =
        organizationRepository
            .findByExternalIdIncludingDeleted(orgExternalId)
            .orElseThrow(NonexistentOrgException::new);
    oktaRepository.deleteOrganization(orgToDelete);
    return orgToDelete;
  }
}
