package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.SiteAdminEmailList;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Authorization translation bean: looks at the current user and tells you what things they can do.
 */
@Component(AuthorizationConfiguration.AUTHORIZER_BEAN)
public class UserAuthorizationVerifier {

  private static final Logger LOG = LoggerFactory.getLogger(UserAuthorizationVerifier.class);

  private SiteAdminEmailList _admins;
  private IdentitySupplier _supplier;
  private OrganizationService _orgService;
  private ApiUserRepository _userRepo;
  private PersonRepository _personRepo;
  private TestEventRepository _testEventRepo;
  private TestOrderRepository _testOrderRepo;
  private OktaRepository _oktaRepo;

  public UserAuthorizationVerifier(
      SiteAdminEmailList admins,
      IdentitySupplier supplier,
      OrganizationService orgService,
      ApiUserRepository userRepo,
      PersonRepository personRepo,
      TestEventRepository testEventRepo,
      OktaRepository oktaRepo) {
    super();
    this._admins = admins;
    this._supplier = supplier;
    this._orgService = orgService;
    this._userRepo = userRepo;
    this._personRepo = personRepo;
    this._testEventRepo = testEventRepo;
    this._oktaRepo = oktaRepo;
  }

  public boolean userHasSiteAdminRole() {
    System.out.println("SITE ADMIN\n\n\n\n\n");
    isValidUser();
    IdentityAttributes id = _supplier.get();
    return id != null && _admins.contains(id.getUsername());
  }

  public boolean userHasPermissions(Set<UserPermission> permissions) {
    isValidUser();
    Optional<OrganizationRoles> orgRoles = _orgService.getCurrentOrganizationRoles();
    // more troubleshooting help here.
    // Note: if your not reaching this code, then grep for
    // 'AbstractAccessDecisionManager.accessDenied' in
    // spring library AffirmativeBased.java and set a breakpoint there.
    if (orgRoles.isEmpty()) {
      LOG.warn("Permission request for {} failed. No roles for org defined.", permissions);
      return false;
    }
    // check that all the granted permissions contain this permission.
    Set<UserPermission> failedChecks =
        permissions.stream()
            .filter(permission -> !orgRoles.get().getGrantedPermissions().contains(permission))
            .collect(Collectors.toSet());

    if (!failedChecks.isEmpty()) {
      // if failed checks are empty, then user has permission
      LOG.warn(
          "Permissions request for {} failed. Failed permission: {}", permissions, failedChecks);
      return false;
    }

    return true;
  }

  public boolean userIsNotSelf(UUID userId) {
    isValidUser();
    IdentityAttributes id = _supplier.get();
    return !getUser(userId).getLoginEmail().equals(id.getUsername());
  }

  public boolean userHasPermission(UserPermission permission) {
    return userHasPermissions(Set.of(permission));
  }

  public boolean userIsInSameOrg(UUID userId) {
    isValidUser();
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    String otherUserEmail = getUser(userId).getLoginEmail();
    Optional<Organization> otherOrg =
        _oktaRepo
            .getOrganizationRoleClaimsForUser(otherUserEmail)
            .map(r -> _orgService.getOrganization(r.getOrganizationExternalId()));
    return currentOrgRoles.isPresent()
        && otherOrg.isPresent()
        && currentOrgRoles
            .get()
            .getOrganization()
            .getExternalId()
            .equals(otherOrg.get().getExternalId());
  }

  public boolean userCanViewTestEvent(UUID testEventId) {
    isValidUser();
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isPresent()) {
      return false;
    } else if (currentOrgRoles.get().grantsAllFacilityAccess()) {
      return true;
    } else {
      Optional<TestEvent> testEvent = _testEventRepo.findById(testEventId);
      if (testEvent.isEmpty()) {
        return false;
      } else {
        return currentOrgRoles.get().getFacilities().stream()
            .anyMatch(f -> f.getInternalId().equals(testEvent.get().getFacility().getInternalId()));
      }
    }
  }

  public boolean userCanViewTestOrder(UUID testOrderId) {
    isValidUser();
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isPresent()) {
      return false;
    } else if (currentOrgRoles.get().grantsAllFacilityAccess()) {
      return true;
    } else {
      Optional<TestOrder> testOrder = _testOrderRepo.findById(testOrderId);
      if (testOrder.isEmpty()) {
        return false;
      } else {
        return currentOrgRoles.get().getFacilities().stream()
            .anyMatch(f -> f.getInternalId().equals(testOrder.get().getFacility().getInternalId()));
      }
    }
  }

  public boolean userCanAccessFacility(UUID facilityId) {
    isValidUser();
    if (facilityId == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isPresent()) {
      System.out.println("\n\n\n\n\nFACILITIES_ACCESS="+currentOrgRoles.get().getFacilities().toString());
    }
    return currentOrgRoles.isPresent()
        && (currentOrgRoles.get().grantsAllFacilityAccess() ||
            currentOrgRoles.get().getFacilities().stream()
                .anyMatch(f -> f.getInternalId().equals(facilityId)));
  }

  public boolean userCanAccessFacilityOfPatient(Person patient) {
    isValidUser();
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    return patient.getFacility() == null
        || (currentOrgRoles.isPresent()
            && (currentOrgRoles.get().grantsAllFacilityAccess() ||
                currentOrgRoles.get().getFacilities().stream()
                    .anyMatch(f -> f.getInternalId().equals(
                        patient.getFacility().getInternalId()))));
  }

  public boolean userCanAccessFacilityOfPatient(UUID patientId) {
    Optional<Person> patient = _personRepo.findById(patientId);
    return patient.isPresent() && userCanAccessFacilityOfPatient(patient.get());
  }

  public boolean userHasSpecificPatientSearchPermission(
      UUID facilityId, boolean isArchived, String namePrefixMatch) {
    if (facilityId == null) {
      System.out.println("SEARCH PERM1facilityId == null");
    } else {
      System.out.println("SEARCH PERM1facilityId == "+facilityId.toString());
    }
    System.out.println("SEARCH PERM2\n\n\n\n\n" + String.valueOf(isArchived) + namePrefixMatch);
    Set<UserPermission> perms = new HashSet<>();

    if (facilityId != null && !userCanAccessFacility(facilityId)) {
        return false;
    }
    if (isArchived) {
      perms.add(UserPermission.READ_ARCHIVED_PATIENT_LIST);
    }
    if (namePrefixMatch != null) {
      perms.add(UserPermission.SEARCH_PATIENTS);
    } else {
      // because namePrefixMatch is null, they are reading permissions across all patients
      perms.add(UserPermission.READ_PATIENT_LIST);
    }

    // check all the permissions in one call.
    return userHasPermissions(perms);
  }

  private void isValidUser() {
    IdentityAttributes id = _supplier.get();
    if (id == null) {
      throw new UnidentifiedUserException();
    }
    Optional<ApiUser> found = _userRepo.findByLoginEmail(id.getUsername());
    if (!found.isPresent()) {
      throw new NonexistentUserException();
    }
  }

  // This replicates getUser() in ApiUserService.java, but we cannot call that logic directly or
  // else that method
  // would have to either a) become public with no method-level security, which is bad; or b) become
  // public with
  // method-level security that invokes an above method which creates a circular loop with this
  // method.
  private ApiUser getUser(UUID id) {
    Optional<ApiUser> found = _userRepo.findById(id);
    return found.orElseThrow(NonexistentUserException::new);
  }
}
