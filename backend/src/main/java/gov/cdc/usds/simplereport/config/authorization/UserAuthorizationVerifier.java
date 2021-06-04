package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.api.CurrentAccountRequestContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentQueueItemException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.AuthorizationService;
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
import org.springframework.transaction.annotation.Transactional;

/**
 * Authorization translation bean: looks at the current user and tells you what things they can do.
 */
@Component(AuthorizationConfiguration.AUTHORIZER_BEAN)
@Transactional(readOnly = true)
public class UserAuthorizationVerifier {

  private static final Logger LOG = LoggerFactory.getLogger(UserAuthorizationVerifier.class);

  private IdentitySupplier _supplier;
  private OrganizationService _orgService;
  private ApiUserRepository _userRepo;
  private PersonRepository _personRepo;
  private FacilityRepository _facilityRepo;
  private TestEventRepository _testEventRepo;
  private TestOrderRepository _testOrderRepo;
  private PatientLinkRepository _patientLinkRepo;
  private OktaRepository _oktaRepo;
  private AuthorizationService _authService;
  private CurrentAccountRequestContextHolder _contextHolder;

  public UserAuthorizationVerifier(
      IdentitySupplier supplier,
      OrganizationService orgService,
      ApiUserRepository userRepo,
      PersonRepository personRepo,
      FacilityRepository facilityRepo,
      TestEventRepository testEventRepo,
      TestOrderRepository testOrderRepo,
      PatientLinkRepository patientLinkRepo,
      OktaRepository oktaRepo,
      AuthorizationService authService,
      CurrentAccountRequestContextHolder contextHolder) {
    super();
    this._supplier = supplier;
    this._orgService = orgService;
    this._userRepo = userRepo;
    this._personRepo = personRepo;
    this._facilityRepo = facilityRepo;
    this._testEventRepo = testEventRepo;
    this._testOrderRepo = testOrderRepo;
    this._patientLinkRepo = patientLinkRepo;
    this._oktaRepo = oktaRepo;
    this._authService = authService;
    this._contextHolder = contextHolder;
  }

  public boolean userHasSiteAdminRole() {
    return _authService.isSiteAdmin();
  }

  public boolean userHasPermissions(Set<UserPermission> permissions) {
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
    IdentityAttributes id = _supplier.get();
    return !getUser(userId).getLoginEmail().equals(id.getUsername());
  }

  public boolean userHasPermission(UserPermission permission) {
    return userHasPermissions(Set.of(permission));
  }

  public boolean userIsInSameOrg(UUID userId) {
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
    if (testEventId == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isEmpty()) {
      return false;
    } else {
      Optional<TestEvent> testEvent = _testEventRepo.findById(testEventId);
      return testEvent.isPresent()
          && currentOrgRoles.get().containsFacility(testEvent.get().getFacility());
    }
  }

  public boolean userCanViewQueueItem(UUID testOrderId) {
    if (testOrderId == null) {
      return true;
    }
    Optional<TestOrder> testOrder = _testOrderRepo.fetchQueueItemById(testOrderId);
    if (testOrder.isEmpty()) {
      throw new NonexistentQueueItemException();
    }
    return testOrder.isPresent() && userCanViewQueueItem(testOrder.get());
  }

  public boolean userCanViewQueueItem(TestOrder testOrder) {
    if (testOrder == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    return currentOrgRoles.isPresent()
        && currentOrgRoles.get().containsFacility(testOrder.getFacility());
  }

  public boolean userCanViewQueueItemForPatient(UUID patientId) {
    if (patientId == null) {
      return true;
    } else if (!userCanViewPatient(patientId)) {
      return false;
    }
    Optional<Person> patient = _personRepo.findById(patientId);
    if (patient.isEmpty()) {
      return false;
    }
    Organization org = patient.get().getOrganization();
    Optional<TestOrder> order = _testOrderRepo.fetchQueueItem(org, patient.get());
    if (order.isEmpty()) {
      throw new NonexistentQueueItemException();
    }
    return userCanViewQueueItem(order.get());
  }

  public boolean userCanAccessFacility(UUID facilityId) {
    if (facilityId == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isEmpty()) {
      return false;
    } else {
      Optional<Facility> facility = _facilityRepo.findById(facilityId);
      return facility.isPresent() && currentOrgRoles.get().containsFacility(facility.get());
    }
  }

  public boolean userCanViewPatient(Person patient) {
    if (patient == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isEmpty()) {
      return false;
    } else if (!currentOrgRoles
        .get()
        .getOrganization()
        .getInternalId()
        .equals(patient.getOrganization().getInternalId())) {
      return false;
    } else if (patient.getFacility() == null) {
      return true;
    } else {
      return currentOrgRoles.isPresent()
          && currentOrgRoles.get().containsFacility(patient.getFacility());
    }
  }

  public boolean userCanViewPatient(UUID patientId) {
    if (patientId == null) {
      return true;
    }
    Optional<Person> patient = _personRepo.findById(patientId);
    return patient.isPresent() && userCanViewPatient(patient.get());
  }

  public boolean userCanAccessPatientLink(UUID patientLinkId) {
    if (patientLinkId == null) {
      return true;
    }
    Optional<OrganizationRoles> currentOrgRoles = _orgService.getCurrentOrganizationRoles();
    if (currentOrgRoles.isEmpty()) {
      return false;
    } else {
      Optional<PatientLink> patientLink = _patientLinkRepo.findById(patientLinkId);
      return patientLink.isPresent()
          && currentOrgRoles.get().containsFacility(patientLink.get().getTestOrder().getFacility());
    }
  }

  public boolean userHasSpecificPatientSearchPermission(
      UUID facilityId, boolean isArchived, String namePrefixMatch) {
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

  public boolean userIsValid() {
    IdentityAttributes id = _supplier.get();
    if (id == null) {
      throw new UnidentifiedUserException();
    }
    Optional<ApiUser> found = _userRepo.findByLoginEmail(id.getUsername());
    if (!found.isPresent()) {
      throw new NonexistentUserException();
    }

    return true;
  }

  // This replicates getUser() in ApiUserService.java, but we cannot call that logic directly or
  // else that method
  // would have to either a) become public with no method-level security, which is bad; or b) become
  // public with
  // method-level security that invokes an above method which creates a circular loop with this
  // method.
  private ApiUser getUser(UUID id) {
    Optional<ApiUser> found = _userRepo.findByIdIncludeArchived(id);
    return found.orElseThrow(NonexistentUserException::new);
  }

  public boolean permitAllAccountRequests() {
    _contextHolder.setIsAccountRequest(true);
    return true;
  }
}
