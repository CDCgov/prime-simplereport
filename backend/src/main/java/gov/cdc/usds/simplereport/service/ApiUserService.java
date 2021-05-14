package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = false)
public class ApiUserService {

  @Autowired private AuthorizationService _authService;

  @Autowired private ApiUserRepository _apiUserRepo;

  @Autowired private IdentitySupplier _supplier;

  @Autowired private OrganizationService _orgService;

  @Autowired private OktaRepository _oktaRepo;

  @Autowired private CurrentPatientContextHolder _contextHolder;

  private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public UserInfo createUser(
      String username, PersonName name, String organizationExternalId, Role role) {
    Organization org = _orgService.getOrganization(organizationExternalId);
    return createUserHelper(username, name, org, role);
  }

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public UserInfo createUserInCurrentOrg(String username, PersonName name, Role role) {
    Organization org = _orgService.getCurrentOrganization();
    return createUserHelper(username, name, org, role);
  }

  private UserInfo createUserHelper(String username, PersonName name, Organization org, Role role) {
    IdentityAttributes userIdentity = new IdentityAttributes(username, name);
    ApiUser apiUser = _apiUserRepo.save(new ApiUser(username, userIdentity));
    // for now, all new users have no access to any facilities by default unless they are admins
    Set<OrganizationRole> roles =
        EnumSet.of(role.toOrganizationRole(), OrganizationRole.getDefault());
    Optional<OrganizationRoleClaims> roleClaims =
        _oktaRepo.createUser(userIdentity, org, Set.of(), roles);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(c -> _orgService.getOrganizationRoles(c));
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    LOG.info(
        "User with id={} created by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId().toString());

    return user;
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo updateUser(UUID userId, PersonName name) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();

    PersonName nameInfo = apiUser.getNameInfo();
    nameInfo.setFirstName(name.getFirstName());
    nameInfo.setMiddleName(name.getMiddleName());
    nameInfo.setLastName(name.getLastName());
    nameInfo.setSuffix(name.getSuffix());
    apiUser = _apiUserRepo.save(apiUser);

    IdentityAttributes userIdentity = new IdentityAttributes(username, name);
    Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.updateUser(userIdentity);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(_orgService::getOrganizationRoles);
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    LOG.info(
        "User with id={} updated by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId().toString());

    return user;
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUserNotSelf
  public UserInfo updateUserPrivileges(
      UUID userId, boolean accessAllFacilities, Set<UUID> facilities, Role role) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    Set<Facility> facilitiesFound = _orgService.getFacilities(org, facilities);
    Optional<OrganizationRoleClaims> newOrgClaims =
        _oktaRepo.updateUserPrivileges(
            username, org, facilitiesFound, getOrganizationRoles(role, accessAllFacilities));
    Optional<OrganizationRoles> orgRoles =
        newOrgClaims.map(c -> _orgService.getOrganizationRoles(org, c));
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin(apiUser));

    LOG.info(
        "User with id={} updated by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId());

    return user;
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUserNotSelf
  public UserInfo setIsDeleted(UUID userId, boolean deleted) {
    ApiUser apiUser = getApiUser(userId, !deleted);
    apiUser.setIsDeleted(deleted);
    apiUser = _apiUserRepo.save(apiUser);
    _oktaRepo.setUserIsActive(apiUser.getLoginEmail(), !deleted);
    return new UserInfo(apiUser, Optional.empty(), isAdmin(apiUser));
  }

  private ApiUser getApiUser(UUID id) {
    return getApiUser(id, false);
  }

  private ApiUser getApiUser(UUID id, Boolean includeArchived) {
    Optional<ApiUser> found =
        includeArchived ? _apiUserRepo.findByIdIncludeArchived(id) : _apiUserRepo.findById(id);
    if (!found.isPresent()) {
      throw new NonexistentUserException();
    }
    ApiUser user = found.get();
    return user;
  }

  private Set<OrganizationRole> getOrganizationRoles(Role role, boolean accessAllFacilities) {
    Set<OrganizationRole> result = EnumSet.of(role.toOrganizationRole());
    if (accessAllFacilities) {
      result.add(OrganizationRole.ALL_FACILITIES);
    }

    return result;
  }

  // In the future, this should be removed, but in the meantime, always return false.
  // For more detail see comments on: https://github.com/CDCgov/prime-simplereport/pull/1218
  public boolean isAdmin(ApiUser user) {
    return false;
  }

  // Creating separate getCurrentApiUser() methods because the auditing use case and
  // sample data initialization require contained transactions, while Sonar requires
  // a non-Transactional version to be called from other methods in the same class
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public ApiUser getCurrentApiUserInContainedTransaction() {
    return getCurrentApiUser();
  }

  private ApiUser getPatientApiUser() {
    Person patient = _contextHolder.getPatient();
    if (patient == null) {
      throw new UnidentifiedUserException();
    }

    String username = getPatientIdEmail(patient);
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(username);

    if (found.isPresent()) {
      LOG.debug("Patient has logged in before: retrieving user record.");
      ApiUser user = found.get();
      user.updateLastSeen();
      user = _apiUserRepo.save(user);
      return user;
    } else {
      LOG.info("Initial login for patient: creating user record.");
      ApiUser user = new ApiUser(username, patient.getNameInfo());
      user.updateLastSeen();
      user = _apiUserRepo.save(user);

      LOG.info(
          "Patient user with id={} self-created from link {}",
          user.getInternalId(),
          _contextHolder.getPatientLink().getInternalId());
      return user;
    }
  }

  private static final String NOREPLY = "-noreply@simplereport.gov";
  private static final String PATIENT_SELF_REGISTRATION_EMAIL =
      "patient-self-registration" + NOREPLY;

  private String getPatientIdEmail(Person patient) {
    return patient.getInternalId() + NOREPLY;
  }

  /**
   * The Patient Registration User should <em>always</em> exist. Originally it was created in a
   * migration, but the app shouldn't crash if that row is missing. Instead, create it!
   */
  private ApiUser getPatientRegistrationApiUser() {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(PATIENT_SELF_REGISTRATION_EMAIL);
    return found.orElseGet(
        () -> {
          ApiUser magicUser =
              new ApiUser(
                  PATIENT_SELF_REGISTRATION_EMAIL,
                  new PersonName("", "", "Patient Self-Registration User", ""));
          LOG.info(
              "Magic patient registration user not found. Created Person={}",
              magicUser.getInternalId());
          _apiUserRepo.save(magicUser);
          return magicUser;
        });
  }

  private ApiUser getCurrentApiUser() {
    IdentityAttributes userIdentity = _supplier.get();
    if (userIdentity == null) {
      if (_contextHolder.hasPatientLink()) {
        return getPatientApiUser();
      }

      if (_contextHolder.isPatientSelfRegistrationRequest()) {
        return getPatientRegistrationApiUser();
      }

      throw new UnidentifiedUserException();
    }

    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(userIdentity.getUsername());
    if (found.isPresent()) {
      LOG.debug("User has logged in before: retrieving user record.");
      ApiUser user = found.get();
      user.updateLastSeen();
      user = _apiUserRepo.save(user);
      return user;
    } else {
      // Assumes user already has a corresponding Okta entity; otherwise, they couldn't log in :)
      LOG.info("Initial login for user: creating user record.");
      ApiUser user = new ApiUser(userIdentity.getUsername(), userIdentity);
      user.updateLastSeen();
      user = _apiUserRepo.save(user);

      LOG.info("User with id={} self-created", user.getInternalId());

      return user;
    }
  }

  public UserInfo getCurrentUserInfo() {
    ApiUser currentUser = getCurrentApiUser();
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    boolean isAdmin = _authService.isSiteAdmin();
    return new UserInfo(currentUser, currentOrgRoles, isAdmin);
  }

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public List<ApiUser> getUsersInCurrentOrg() {
    Organization org = _orgService.getCurrentOrganization();
    final Set<String> orgUserEmails = _oktaRepo.getAllUsersForOrganization(org);
    return _apiUserRepo.findAllByLoginEmailInOrderByName(orgUserEmails);
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo getUser(final UUID userId) {
    final Optional<ApiUser> optApiUser = _apiUserRepo.findById(userId);
    if (optApiUser.isEmpty()) {
      throw new UnidentifiedUserException();
    }
    final ApiUser apiUser = optApiUser.get();

    Optional<OrganizationRoleClaims> optClaims =
        _oktaRepo.getOrganizationRoleClaimsForUser(apiUser.getLoginEmail());
    if (optClaims.isEmpty()) {
      throw new UnidentifiedUserException();
    }
    final OrganizationRoleClaims claims = optClaims.get();

    // use the target user's org so response is built correctly even if site admin is the requester
    Organization org = _orgService.getOrganization(claims.getOrganizationExternalId());

    List<Facility> facilities = _orgService.getFacilities(org);
    Set<Facility> facilitiesSet = new HashSet<>(facilities);
    Map<UUID, Facility> facilitiesByUUID =
        facilities.stream().collect(Collectors.toMap(Facility::getInternalId, Function.identity()));

    boolean allFacilityAccess = claims.grantsAllFacilityAccess();
    Set<Facility> accessibleFacilities =
        allFacilityAccess
            ? facilitiesSet
            : claims.getFacilities().stream()
                .map(facilitiesByUUID::get)
                .collect(Collectors.toSet());
    OrganizationRoles orgRoles =
        new OrganizationRoles(org, accessibleFacilities, claims.getGrantedRoles());
    return new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser));
  }
}
