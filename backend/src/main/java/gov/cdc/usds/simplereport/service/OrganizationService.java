package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.CurrentOrganizationRolesContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.validators.OrderingProviderRequiredValidator;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.support.ScopeNotActiveException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
@RequiredArgsConstructor
public class OrganizationService {

  private final OrganizationRepository organizationRepository;
  private final FacilityRepository facilityRepository;
  private final ProviderRepository providerRepository;
  private final AuthorizationService authorizationService;
  private final OktaRepository oktaRepository;
  private final CurrentOrganizationRolesContextHolder organizationRolesContext;
  private final OrderingProviderRequiredValidator orderingProviderValidator;
  private final PatientSelfRegistrationLinkService patientSelfRegistrationLinkService;
  private final DeviceTypeRepository deviceTypeRepository;

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

  public List<Organization> getOrganizationsByName(String name) {
    return organizationRepository.findAllByName(name);
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

  public Organization getOrganizationByFacilityId(UUID facilityId) {
    Facility facility = facilityRepository.findById(facilityId).orElse(null);

    if (facility == null) {
      return null;
    }

    return facility.getOrganization();
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

    facility.getDeviceTypes().forEach(facility::removeDeviceType);

    deviceIds.stream()
        .map(deviceTypeRepository::findById)
        .forEach(deviceTypeOptional -> deviceTypeOptional.ifPresent(facility::addDeviceType));

    return facilityRepository.save(facility);
  }

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
      oktaRepository.activateOrganization(org);
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
    return oktaRepository.activateOrganizationWithSingleUser(org);
  }

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
            organization,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            phone,
            email,
            orderingProvider,
            configuredDevices);
    facility = facilityRepository.save(facility);
    patientSelfRegistrationLinkService.createRegistrationLink(facility);
    oktaRepository.createFacility(facility);
    return facility;
  }

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
      String providerNPI) {
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
    if (optionalFacility.isEmpty()) {
      throw new IllegalGraphqlArgumentException("Facility not found.");
    }
    Facility facility = optionalFacility.get();
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
}
