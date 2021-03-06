package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.api.pxp.CurrentPatientContextHolder;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
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

  @Autowired private SiteAdminEmailList _siteAdmins;

  @Autowired private ApiUserRepository _apiUserRepo;

  @Autowired private IdentitySupplier _supplier;

  @Autowired private OrganizationService _orgService;

  @Autowired private OktaRepository _oktaRepo;

  @Autowired private CurrentPatientContextHolder _contextHolder;

  private static final Logger LOG = LoggerFactory.getLogger(ApiUserService.class);

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public UserInfo createUser(
      String username,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String organizationExternalId,
      OrganizationRole role) {
    Organization org = _orgService.getOrganization(organizationExternalId);
    return createUserHelper(username, firstName, middleName, lastName, suffix, org, role);
  }

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public UserInfo createUserInCurrentOrg(
      String username,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      OrganizationRole role) {
    Organization org = _orgService.getCurrentOrganization();
    return createUserHelper(username, firstName, middleName, lastName, suffix, org, role);
  }

  private UserInfo createUserHelper(
      String username,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      Organization org,
      OrganizationRole role) {
    IdentityAttributes userIdentity =
        new IdentityAttributes(username, firstName, middleName, lastName, suffix);
    ApiUser apiUser = _apiUserRepo.save(new ApiUser(username, userIdentity));
    // for now, all new users can access all facilities
    Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.createUser(userIdentity, org, Optional.empty(), role);
    Optional<OrganizationRoles> orgRoles =
        roleClaims.map(c -> _orgService.getOrganizationRoles(c));
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    LOG.info(
        "User with id={} created by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId().toString());

    return user;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
  public UserInfo updateUser(
      UUID userId,
      String username,
      String firstName,
      String middleName,
      String lastName,
      String suffix) {
    ApiUser apiUser = getApiUser(userId);
    String oldUsername = apiUser.getLoginEmail();

    apiUser.setLoginEmail(username);
    PersonName nameInfo = apiUser.getNameInfo();
    nameInfo.setFirstName(firstName);
    nameInfo.setMiddleName(middleName);
    nameInfo.setLastName(lastName);
    nameInfo.setSuffix(suffix);
    apiUser = _apiUserRepo.save(apiUser);

    IdentityAttributes userIdentity =
        new IdentityAttributes(username, firstName, middleName, lastName, suffix);
    Optional<OrganizationRoleClaims> roleClaims = _oktaRepo.updateUser(oldUsername, userIdentity);
    Optional<OrganizationRoles> orgRoles = roleClaims.map(c ->_orgService.getOrganizationRoles(c));
    boolean isAdmin = isAdmin(apiUser);
    UserInfo user = new UserInfo(apiUser, orgRoles, isAdmin);

    LOG.info(
        "User with id={} updated by user with id={}",
        apiUser.getInternalId(),
        getCurrentApiUser().getInternalId().toString());

    return user;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
  public OrganizationRole updateUserRole(UUID userId, OrganizationRole role) {
    ApiUser user = getApiUser(userId);
    String username = user.getLoginEmail();
    OrganizationRoleClaims orgClaims =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(username)
            .orElseThrow(MisconfiguredUserException::new);
    Organization org = _orgService.getOrganization(orgClaims.getOrganizationExternalId());
    Optional<OrganizationRoleClaims> newOrgClaims = _oktaRepo.updateUserRole(username, org, role);
    Optional<OrganizationRole> newRole =
        newOrgClaims.map(c -> c.getEffectiveRole().orElseThrow(MisconfiguredUserException::new));
    return newRole.orElseThrow(MisconfiguredUserException::new);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUserOrPermissionManageTargetUser
  public UserInfo setIsDeleted(UUID userId, boolean deleted) {
    ApiUser apiUser = getApiUser(userId);
    apiUser.setIsDeleted(deleted);
    apiUser = _apiUserRepo.save(apiUser);
    _oktaRepo.setUserIsActive(apiUser.getLoginEmail(), !deleted);
    return new UserInfo(apiUser, Optional.empty(), isAdmin(apiUser));
  }

  private ApiUser getApiUser(UUID id) {
    Optional<ApiUser> found = _apiUserRepo.findById(id);
    if (!found.isPresent()) {
      throw new NonexistentUserException();
    }
    ApiUser user = found.get();
    return user;
  }

  public boolean isAdmin(ApiUser user) {
    return _siteAdmins.contains(user.getLoginEmail());
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

  private String getPatientIdEmail(Person patient) {
    return patient.getInternalId() + "-noreply@simplereport.gov";
  }

  private ApiUser getCurrentApiUser() {
    IdentityAttributes userIdentity = _supplier.get();
    if (userIdentity == null) {
      if (_contextHolder.hasPatientLink()) {
        // we're in a patient experience interaction
        return getPatientApiUser();
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
    boolean isAdmin = isAdmin(currentUser);
    return new UserInfo(currentUser, currentOrgRoles, isAdmin);
  }

  @AuthorizationConfiguration.RequirePermissionManageUsers
  public List<UserInfo> getUsersInCurrentOrg() {
    Organization org = _orgService.getCurrentOrganization();
    Map<String, OrganizationRoleClaims> userClaims = _oktaRepo.getAllUsersForOrganization(org);
    Set<ApiUser> apiUsers = _apiUserRepo.findAllByLoginEmailIn(userClaims.keySet());
    // will add facilities to their users in a subsequent PR
    List<Facility> facilities = _orgService.getFacilities(org);
    Set<Facility> facilitiesSet = new HashSet<>(facilities);
    Map<UUID, Facility> facilitiesByUUID = 
        facilities.stream().collect(Collectors.toMap(f -> f.getInternalId(), f -> f));
    return apiUsers.stream()
        .map(
            u -> {
              OrganizationRoleClaims claims = userClaims.get(u.getLoginEmail());
              boolean allFacilityAccess = claims.getFacilityRestrictions().isEmpty();
              Set<Facility> accessibleFacilities = allFacilityAccess 
                  ? facilitiesSet
                  : claims.getFacilityRestrictions().get().stream()
                      .map(uuid -> facilitiesByUUID.get(uuid))
                      .collect(Collectors.toSet());
              OrganizationRoles orgRoles = 
                  new OrganizationRoles(org, 
                                        allFacilityAccess,
                                        accessibleFacilities,
                                        claims.getGrantedRoles());
              return new UserInfo(u, Optional.of(orgRoles), isAdmin(u));
            })
        .collect(Collectors.toList());
  }
}
