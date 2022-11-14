package gov.cdc.usds.simplereport.service;

import com.okta.sdk.resource.user.UserStatus;
import gov.cdc.usds.simplereport.api.ApiUserContextHolder;
import gov.cdc.usds.simplereport.api.CurrentAccountRequestContextHolder;
import gov.cdc.usds.simplereport.api.WebhookContextHolder;
import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.support.ScopeNotActiveException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;

@Service
@Transactional(readOnly = false)
@Slf4j
public class ApiUserService {

  @Autowired private AuthorizationService _authService;

  @Autowired private ApiUserRepository _apiUserRepo;

  @Autowired private IdentitySupplier _supplier;

  @Autowired private OrganizationService _orgService;

  @Autowired private OktaRepository _oktaRepo;

  @Autowired private TenantDataAccessService _tenantService;

  @Autowired private CurrentPatientContextHolder _patientContextHolder;

  @Autowired private CurrentAccountRequestContextHolder _accountRequestContextHolder;

  @Autowired private WebhookContextHolder _webhookContextHolder;

  @Autowired private ApiUserContextHolder _apiUserContextHolder;

  public boolean userExists(String username) {
    Optional<ApiUser> found =
        _apiUserRepo.findByLoginEmailIncludeArchived(username.toLowerCase().strip());
    return found.isPresent();
  }

  public UserInfo createUser(
      String username, PersonName name, String organizationExternalId, Role role) {
    Organization org = _orgService.getOrganization(organizationExternalId);
    return createUserHelper(username, name, org, role);
  }

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public UserInfo createUserInCurrentOrg(
      String username, PersonName name, Role role, boolean active) {
    Organization org = _orgService.getCurrentOrganization();

    Optional<ApiUser> found = _apiUserRepo.findByLoginEmailIncludeArchived(username.toLowerCase());
    if (found.isPresent()) {
      return reprovisionUser(found.get(), name, org, role);
    }

    return createUserHelper(username, name, org, role);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public ApiUser createApiUserNoOkta(String email, PersonName name) {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmailIncludeArchived(email.toLowerCase());
    if (found.isPresent()) {
      throw new IllegalGraphqlArgumentException("User already exists");
    } else {
      IdentityAttributes userIdentity = new IdentityAttributes(email, name);
      ApiUser apiUser = _apiUserRepo.save(new ApiUser(email, userIdentity));
      log.info(
          "User with id={} created by user with id={}",
          apiUser.getInternalId(),
          getCurrentApiUser().getInternalId().toString());

      return apiUser;
    }
  }

  private UserInfo reprovisionUser(ApiUser apiUser, PersonName name, Organization org, Role role) {
    if (!apiUser.isDeleted()) {
      // an enabled user with this email address exists (in some org)
      throw new ConflictingUserException();
    }

    OrganizationRoleClaims claims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(apiUser.getLoginEmail())
            .orElseThrow(MisconfiguredUserException::new);
    if (!org.getExternalId().equals(claims.getOrganizationExternalId())) {
      throw new AccessDeniedException("Unable to add user.");
    }

    // re-provision the user
    IdentityAttributes userIdentity = new IdentityAttributes(apiUser.getLoginEmail(), name);
    _oktaRepo.reprovisionUser(userIdentity);

    // for now, all re-enabled users have no access to facilities unless they are admins
    Set<OrganizationRole> roles =
        EnumSet.of(role.toOrganizationRole(), OrganizationRole.getDefault());
    Optional<OrganizationRoleClaims> roleClaims =
        _oktaRepo.updateUserPrivileges(apiUser.getLoginEmail(), org, Set.of(), roles);

    apiUser.setNameInfo(name);
    apiUser.setIsDeleted(false);

    Optional<OrganizationRoles> orgRoles = roleClaims.map(c -> _orgService.getOrganizationRoles(c));
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    log.info(
        "User with id={} re-provisioned by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId());

    return user;
  }

  private UserInfo createUserHelper(String username, PersonName name, Organization org, Role role) {
    IdentityAttributes userIdentity = new IdentityAttributes(username, name);
    ApiUser apiUser = _apiUserRepo.save(new ApiUser(username, userIdentity));
    boolean active = org.getIdentityVerified();
    // for now, all new users have no access to any facilities by default unless they are admins
    Set<OrganizationRole> roles =
        EnumSet.of(role.toOrganizationRole(), OrganizationRole.getDefault());
    Optional<OrganizationRoleClaims> roleClaims =
        _oktaRepo.createUser(userIdentity, org, Set.of(), roles, active);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(c -> _orgService.getOrganizationRoles(c));
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    log.info(
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

    log.info(
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

    log.info(
        "User with id={} updated by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId());

    return user;
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo updateUserEmail(UUID userId, String email) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    IdentityAttributes userIdentity = new IdentityAttributes(username, apiUser.getNameInfo());

    // Check to make sure the changed email doesn't already exist in the system.
    Optional<ApiUser> foundUser = _apiUserRepo.findByLoginEmail(email);
    if (foundUser.isPresent()) {
      throw new ConflictingUserException();
    }

    apiUser.setLoginEmail(email);
    apiUser = _apiUserRepo.save(apiUser);

    Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.updateUserEmail(userIdentity, email);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(_orgService::getOrganizationRoles);
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    log.info(
        "User with id={} updated by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId().toString());

    return new UserInfo(apiUser, orgRoles, isAdmin(apiUser));
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo resetUserPassword(UUID userId) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    _oktaRepo.resetUserPassword(username);
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    OrganizationRoles orgRoles = _orgService.getOrganizationRoles(org, orgClaims);
    return new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser));
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo resetUserMfa(UUID userId) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    _oktaRepo.resetUserMfa(username);
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    OrganizationRoles orgRoles = _orgService.getOrganizationRoles(org, orgClaims);
    return new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser));
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUserNotSelf
  public UserInfo setIsDeleted(UUID userId, boolean deleted) {
    ApiUser apiUser = getApiUser(userId, !deleted);
    apiUser.setIsDeleted(deleted);
    apiUser = _apiUserRepo.save(apiUser);
    _oktaRepo.setUserIsActive(apiUser.getLoginEmail(), !deleted);
    return new UserInfo(apiUser, Optional.empty(), isAdmin(apiUser));
  }

  // This method is used to reactivate users that have been suspended due to inactivity
  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo reactivateUser(UUID userId) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    _oktaRepo.reactivateUser(username);
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    OrganizationRoles orgRoles = _orgService.getOrganizationRoles(org, orgClaims);
    UserInfo user = new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser));
    return user;
  }

  // This method is to re-send the invitation email to join SimpleReport
  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo resendActivationEmail(UUID userId) {
    ApiUser apiUser = getApiUser(userId);
    String username = apiUser.getLoginEmail();
    _oktaRepo.resendActivationEmail(username);
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    OrganizationRoles orgRoles = _orgService.getOrganizationRoles(org, orgClaims);
    UserInfo user = new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser));
    return user;
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
    Person patient = _patientContextHolder.getPatient();
    if (patient == null) {
      throw new UnidentifiedUserException();
    }

    String username = getPatientIdEmail(patient);
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(username);

    if (found.isPresent()) {
      log.debug("Patient has logged in before: retrieving user record.");
      ApiUser user = found.get();
      user.updateLastSeen();
      user = _apiUserRepo.save(user);
      return user;
    } else {
      log.info("Initial login for patient: creating user record.");
      ApiUser user = new ApiUser(username, patient.getNameInfo());
      user.updateLastSeen();
      user = _apiUserRepo.save(user);

      log.info(
          "Patient user with id={} self-created from link {}",
          user.getInternalId(),
          _patientContextHolder.getPatientLink().getInternalId());
      return user;
    }
  }

  private static final String NOREPLY = "-noreply@simplereport.gov";
  private static final String PATIENT_SELF_REGISTRATION_EMAIL =
      "patient-self-registration" + NOREPLY;
  private static final String ACCOUNT_REQUEST_EMAIL = "account-request" + NOREPLY;
  private static final String WEBHOOK_EMAIL = "webhook" + NOREPLY;
  private static final String ANONYMOUS_EMAIL = "anonymous-user" + NOREPLY;

  private String getPatientIdEmail(Person patient) {
    return patient.getInternalId() + NOREPLY;
  }

  /**
   * The Patient Registration User should <em>always</em> exist. Originally it was created in a
   * migration, but the app shouldn't crash if that row is missing. Instead, create it!
   */
  private ApiUser getPatientSelfRegistrationApiUser() {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(PATIENT_SELF_REGISTRATION_EMAIL);
    return found.orElseGet(
        () -> {
          ApiUser magicUser =
              new ApiUser(
                  PATIENT_SELF_REGISTRATION_EMAIL,
                  new PersonName("", "", "Patient Self-Registration User", ""));
          log.info(
              "Magic patient registration user not found. Created Person={}",
              magicUser.getInternalId());
          _apiUserRepo.save(magicUser);
          return magicUser;
        });
  }

  /** The Account Request User should <em>always</em> exist. */
  private ApiUser getAccountRequestApiUser() {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(ACCOUNT_REQUEST_EMAIL);
    return found.orElseGet(
        () -> {
          ApiUser magicUser =
              new ApiUser(
                  ACCOUNT_REQUEST_EMAIL,
                  new PersonName("", "", "Account Request Self-Registration User", ""));
          _apiUserRepo.save(magicUser);
          log.info(
              "Magic account request self-registration user not found. Created Person={}",
              magicUser.getInternalId());
          return magicUser;
        });
  }

  /** The SMS Webhook API User should <em>always</em> exist. */
  public ApiUser getWebhookApiUser() {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(WEBHOOK_EMAIL);
    return found.orElseGet(
        () -> {
          ApiUser magicUser =
              new ApiUser(WEBHOOK_EMAIL, new PersonName("", "", "Webhook User", ""));
          _apiUserRepo.save(magicUser);
          log.info(
              "Magic account SMS webhook user not found. Created Person={}",
              magicUser.getInternalId());
          return magicUser;
        });
  }

  /** Only used for audit logging. */
  public ApiUser getAnonymousApiUser() {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(ANONYMOUS_EMAIL);
    return found.orElseGet(
        () -> {
          ApiUser magicUser =
              new ApiUser(ANONYMOUS_EMAIL, new PersonName("", "", "Anonymous User", ""));
          _apiUserRepo.save(magicUser);
          log.info(
              "Magic account anonymous user not found. Created Person={}",
              magicUser.getInternalId());
          return magicUser;
        });
  }

  private Optional<ApiUser> getCurrentNonOktaUser(IdentityAttributes userIdentity) {
    if (userIdentity == null) {
      if (_patientContextHolder.hasPatientLink()) {
        return Optional.of(getPatientApiUser());
      }
      if (_patientContextHolder.isPatientSelfRegistrationRequest()) {
        return Optional.of(getPatientSelfRegistrationApiUser());
      }
      if (_accountRequestContextHolder.isAccountRequest()) {
        return Optional.of(getAccountRequestApiUser());
      }
      if (_webhookContextHolder.isWebhook()) {
        return Optional.of(getWebhookApiUser());
      }
      throw new UnidentifiedUserException();
    }
    return Optional.empty();
  }

  private ApiUser getCurrentApiUserFromIdentity(IdentityAttributes userIdentity) {
    Optional<ApiUser> found = _apiUserRepo.findByLoginEmail(userIdentity.getUsername());
    if (found.isPresent()) {
      log.debug("User has logged in before: retrieving user record.");
      ApiUser user = found.get();
      user.updateLastSeen();
      user = _apiUserRepo.save(user);
      return user;
    } else {
      // Assumes user already has a corresponding Okta entity; otherwise, they couldn't log in :)
      log.info("Initial login for user: creating user record.");
      ApiUser user = new ApiUser(userIdentity.getUsername(), userIdentity);
      user.updateLastSeen();
      user = _apiUserRepo.save(user);

      log.info("User with id={} self-created", user.getInternalId());

      return user;
    }
  }

  private ApiUser getCurrentApiUser() {
    if (RequestContextHolder.getRequestAttributes() == null) {
      // short-circuit in the event this is called from outside a request
      return getCurrentApiUserNoCache();
    }
    try {
      if (_apiUserContextHolder.hasBeenPopulated()) {
        log.debug("Retrieving user from request context");
        return _apiUserContextHolder.getCurrentApiUser();
      }
      ApiUser user = getCurrentApiUserNoCache();
      _apiUserContextHolder.setCurrentApiUser(user);
      return user;
    } catch (ScopeNotActiveException e) {
      return getCurrentApiUserNoCache();
    }
  }

  private ApiUser getCurrentApiUserNoCache() {
    IdentityAttributes userIdentity = _supplier.get();
    Optional<ApiUser> nonOktaUser = getCurrentNonOktaUser(userIdentity);
    return nonOktaUser.orElseGet(() -> getCurrentApiUserFromIdentity(userIdentity));
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

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public List<ApiUserWithStatus> getUsersAndStatusInCurrentOrg() {
    Organization org = _orgService.getCurrentOrganization();
    final Map<String, UserStatus> emailsToStatus =
        _oktaRepo.getAllUsersWithStatusForOrganization(org);
    List<ApiUser> users = _apiUserRepo.findAllByLoginEmailInOrderByName(emailsToStatus.keySet());
    return users.stream()
        .map(u -> new ApiUserWithStatus(u, emailsToStatus.get(u.getLoginEmail())))
        .collect(Collectors.toList());
  }

  @AuthorizationConfiguration.RequirePermissionManageTargetUser
  public UserInfo getUser(final UUID userId) {
    final Optional<ApiUser> optApiUser = _apiUserRepo.findById(userId);
    if (optApiUser.isEmpty()) {
      throw new UnidentifiedUserException();
    }
    final ApiUser apiUser = optApiUser.get();

    UserStatus status = _oktaRepo.getUserStatus(apiUser.getLoginEmail());

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
    return new UserInfo(apiUser, Optional.of(orgRoles), isAdmin(apiUser), status);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public UserInfo setCurrentUserTenantDataAccess(
      String organizationExternalID, String justification) {
    if (organizationExternalID == null) {
      return cancelCurrentUserTenantDataAccess();
    }

    if (justification == null) {
      throw new IllegalGraphqlArgumentException("A justification for this access is required.");
    }
    ApiUser apiUser = getCurrentApiUser();
    Organization org = _orgService.getOrganization(organizationExternalID);

    Optional<OrganizationRoleClaims> roleClaims =
        _tenantService.addTenantDataAccess(apiUser, org, justification);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(_orgService::getOrganizationRoles);

    boolean isAdmin = isAdmin(apiUser);

    return new UserInfo(apiUser, orgRoles, isAdmin);
  }

  private UserInfo cancelCurrentUserTenantDataAccess() {
    ApiUser apiUser = getCurrentApiUser();
    _tenantService.removeAllTenantDataAccess(apiUser);
    _orgService.resetOrganizationRolesContext();
    return getCurrentUserInfo();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public Set<String> getTenantDataAccessAuthoritiesForCurrentUser() {
    ApiUser apiUser = getCurrentApiUser();
    return _tenantService.getTenantDataAccessAuthorities(apiUser);
  }
}
