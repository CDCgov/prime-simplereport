package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.CurrentOrganizationRolesContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.validators.OrderingProviderRequiredValidator;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@Slf4j
@RequiredArgsConstructor
public class OrganizationService {

  private final OrganizationRepository _repo;
  private final FacilityRepository _facilityRepo;
  private final ProviderRepository _providerRepo;
  private final AuthorizationService _authService;
  private final OktaRepository _oktaRepo;
  private final CurrentOrganizationRolesContextHolder _currentOrgRolesContextHolder;
  private final OrderingProviderRequiredValidator _orderingProviderRequiredValidator;
  private final PatientSelfRegistrationLinkService _psrlService;
  private final DeviceSpecimenTypeRepository deviceSpecimenTypeRepository;

  public void resetOrganizationRolesContext() {
    _currentOrgRolesContextHolder.reset();
  }

  public Optional<OrganizationRoles> getCurrentOrganizationRoles() {
    if (_currentOrgRolesContextHolder.hasBeenPopulated()) {
      return _currentOrgRolesContextHolder.getOrganizationRoles();
    }
    var result = fetchCurrentOrganizationRoles();
    _currentOrgRolesContextHolder.setOrganizationRoles(result);
    return result;
  }

  private Optional<OrganizationRoles> fetchCurrentOrganizationRoles() {
    List<OrganizationRoleClaims> orgRoles = _authService.findAllOrganizationRoles();
    List<String> candidateExternalIds =
        orgRoles.stream()
            .map(OrganizationRoleClaims::getOrganizationExternalId)
            .collect(Collectors.toList());
    List<Organization> validOrgs = _repo.findAllByExternalId(candidateExternalIds);
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
    Optional<Organization> found = _repo.findByExternalId(externalId);
    return found.orElseThrow(
        () ->
            new IllegalGraphqlArgumentException(
                "An organization with external_id=" + externalId + " does not exist"));
  }

  public List<Organization> getOrganizationsByName(String name) {
    return _repo.findAllByName(name);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public List<Organization> getOrganizations(Boolean identityVerified) {
    return identityVerified == null
        ? _repo.findAll()
        : _repo.findAllByIdentityVerified(identityVerified);
  }

  public Set<Facility> getAccessibleFacilities(
      Organization org, OrganizationRoleClaims roleClaims) {
    // If there are no facility restrictions, get all facilities in org; otherwise,
    // get specified
    // list.
    return roleClaims.grantsAllFacilityAccess()
        ? _facilityRepo.findAllByOrganization(org)
        : _facilityRepo.findAllByOrganizationAndInternalId(org, roleClaims.getFacilities());
  }

  public List<Facility> getFacilities(Organization org) {
    return _facilityRepo.findByOrganizationOrderByFacilityName(org);
  }

  public Set<Facility> getFacilities(Organization org, Collection<UUID> facilityIds) {
    return _facilityRepo.findAllByOrganizationAndInternalId(org, facilityIds);
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
    Facility facility = _facilityRepo.findById(facilityId).orElse(null);

    if (facility == null) {
      return null;
    }

    return facility.getOrganization();
  }

  public void assertFacilityNameAvailable(String testingFacilityName) {
    Organization org = getCurrentOrganization();
    _facilityRepo
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
      String orderingProviderFirstName,
      String orderingProviderMiddleName,
      String orderingProviderLastName,
      String orderingProviderSuffix,
      String orderingProviderNPI,
      StreetAddress orderingProviderAddress,
      String orderingProviderTelephone,
      DeviceSpecimenTypeHolder deviceSpecimenTypes) {

    Facility facility = this.getFacilityInCurrentOrg(facilityId);
    facility.setFacilityName(testingFacilityName);
    facility.setCliaNumber(cliaNumber);
    facility.setTelephone(phone);
    facility.setEmail(email);
    facility.setAddress(facilityAddress);

    Provider p = facility.getOrderingProvider();
    p.getNameInfo().setFirstName(orderingProviderFirstName);
    p.getNameInfo().setMiddleName(orderingProviderMiddleName);
    p.getNameInfo().setLastName(orderingProviderLastName);
    p.getNameInfo().setSuffix(orderingProviderSuffix);
    p.setProviderId(orderingProviderNPI);
    p.setTelephone(orderingProviderTelephone);
    p.setAddress(orderingProviderAddress);

    _orderingProviderRequiredValidator.assertValidity(
        p.getNameInfo(), p.getProviderId(), p.getTelephone(), facility.getAddress().getState());

    facility.getDeviceSpecimenTypes().forEach(facility::removeDeviceSpecimenType);

    for (DeviceSpecimenType ds : deviceSpecimenTypes.getFullList()) {
      Optional<DeviceSpecimenType> deviceSpecimenTypeOptional =
          deviceSpecimenTypeRepository.find(ds.getDeviceType(), ds.getSpecimenType());
      deviceSpecimenTypeOptional.ifPresent(facility::addDeviceSpecimenType);
    }

    Optional<DeviceSpecimenType> deviceSpecimenTypeOptional =
        deviceSpecimenTypeRepository.find(
            deviceSpecimenTypes.getDefault().getDeviceType(),
            deviceSpecimenTypes.getDefault().getSpecimenType());
    deviceSpecimenTypeOptional.ifPresent(facility::addDefaultDeviceSpecimen);

    return _facilityRepo.save(facility);
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
      DeviceSpecimenTypeHolder deviceSpecimenTypes,
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
        deviceSpecimenTypes,
        providerName,
        providerAddress,
        providerTelephone,
        providerNPI);
    return org;
  }

  @Transactional(readOnly = false)
  public Organization createOrganization(String name, String type, String externalId) {
    // for now, all new organizations have identity_verified = false by default
    Organization org = _repo.save(new Organization(name, type, externalId, false));
    _oktaRepo.createOrganization(org);
    _psrlService.createRegistrationLink(org);
    return org;
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Organization updateOrganization(String name, String type) {
    Organization org = getCurrentOrganization();
    org.setOrganizationName(name);
    org.setOrganizationType(type);
    return _repo.save(org);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequirePermissionEditOrganization
  public Organization updateOrganization(String type) {
    Organization org = getCurrentOrganization();
    org.setOrganizationType(type);
    return _repo.save(org);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean setIdentityVerified(String externalId, boolean verified) {
    Organization org = getOrganization(externalId);
    boolean oldStatus = org.getIdentityVerified();
    org.setIdentityVerified(verified);
    boolean newStatus = _repo.save(org).getIdentityVerified();
    if (oldStatus == false && newStatus == true) {
      _oktaRepo.activateOrganization(org);
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
    _repo.save(org);
    return _oktaRepo.activateOrganizationWithSingleUser(org);
  }

  @Transactional(readOnly = false)
  public Facility createFacilityNoPermissions(
      Organization organization,
      String testingFacilityName,
      String cliaNumber,
      StreetAddress facilityAddress,
      String phone,
      String email,
      DeviceSpecimenTypeHolder deviceSpecimenTypes,
      PersonName providerName,
      StreetAddress providerAddress,
      String providerTelephone,
      String providerNPI) {
    _orderingProviderRequiredValidator.assertValidity(
        providerName, providerNPI, providerTelephone, facilityAddress.getState());
    Provider orderingProvider =
        _providerRepo.save(
            new Provider(providerName, providerNPI, providerAddress, providerTelephone));
    Facility facility =
        new Facility(
            organization,
            testingFacilityName,
            cliaNumber,
            facilityAddress,
            phone,
            email,
            orderingProvider,
            deviceSpecimenTypes.getDefault(),
            deviceSpecimenTypes.getFullList());
    facility = _facilityRepo.save(facility);
    _psrlService.createRegistrationLink(facility);
    _oktaRepo.createFacility(facility);
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
      DeviceSpecimenTypeHolder deviceSpecimenTypes,
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
        deviceSpecimenTypes,
        providerName,
        providerAddress,
        providerTelephone,
        providerNPI);
  }
}
