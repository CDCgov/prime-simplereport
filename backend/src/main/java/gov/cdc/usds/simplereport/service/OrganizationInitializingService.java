package gov.cdc.usds.simplereport.service;

import com.okta.sdk.resource.client.ApiException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties.ConfigPatient;
import gov.cdc.usds.simplereport.config.InitialSetupProperties.ConfigPatientRegistrationLink;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoAuthorization;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenBodySiteRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.errors.UserFacilityNotInitializedException;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@Slf4j
@RequiredArgsConstructor
public class OrganizationInitializingService {
  private static final int STANDARD_TEST_LENGTH = 15;
  private final InitialSetupProperties _props;
  private final OrganizationRepository _orgRepo;
  private final ProviderRepository _providerRepo;
  private final DeviceTypeRepository _deviceTypeRepo;
  private final SpecimenTypeRepository _specimenTypeRepo;
  private final DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;
  private final FacilityRepository _facilityRepo;
  private final ApiUserRepository _apiUserRepo;
  private final OktaRepository _oktaRepo;
  private final ApiUserService _userService;
  private final DemoUserConfiguration _demoUserConfiguration;
  private final PersonRepository _personRepository;
  private final PatientRegistrationLinkRepository _prlRepository;
  private final DiseaseService diseaseService;
  private final ConditionRepository conditionRepository;
  private final LabRepository labRepository;
  private final SpecimenRepository specimenRepository;
  private final SpecimenBodySiteRepository specimenBodySiteRepository;

  public void initAll() {

    // Allows any subsequent callers to have a valid user record for purposes of
    // passing permission-checks
    initCurrentUser();

    log.debug("Organization init called (again?)");
    Provider savedProvider = _providerRepo.save(_props.getProvider());

    List<DeviceType> deviceTypes = initDevices();
    List<DeviceType> facilityDeviceTypes =
        deviceTypes.stream()
            .filter(d -> _props.getConfiguredDeviceTypes().contains(d.getName()))
            .collect(Collectors.toList());

    DeviceType defaultDeviceType =
        deviceTypes.stream()
            .filter(deviceType -> "LumiraDX".equals(deviceType.getName()))
            .findFirst()
            .orElse(deviceTypes.get(0));
    SpecimenType defaultSpecimenType = defaultDeviceType.getSwabTypes().get(0);

    List<Organization> emptyOrgs = _props.getOrganizations();
    Map<String, Organization> orgsByExternalId =
        emptyOrgs.stream()
            .map(this::setOrg)
            .collect(Collectors.toMap(Organization::getExternalId, Function.identity()));
    // All existing orgs in the DB which aren't reflected in config properties should
    // still be reflected in demo Okta environment
    _orgRepo.findAll().stream()
        .filter(o -> !orgsByExternalId.containsKey(o.getExternalId()))
        .forEach(o -> orgsByExternalId.put(o.getExternalId(), o));
    orgsByExternalId.values().forEach(this::initOktaOrg);

    Map<String, Facility> facilitiesByName =
        _facilityRepo.findAll().stream()
            .collect(Collectors.toMap(Facility::getFacilityName, Function.identity()));
    List<Facility> facilities =
        setFacilities(
            _props.getFacilities(),
            facilitiesByName,
            orgsByExternalId,
            savedProvider,
            defaultDeviceType,
            defaultSpecimenType,
            facilityDeviceTypes);
    log.info(
        "Creating facilities {} with {} devices configured",
        facilitiesByName.keySet(),
        deviceTypes.size());
    // All existing facilities in the DB which aren't reflected in config properties should
    // still be reflected in demo Okta environment
    _facilityRepo.findAll().stream()
        .filter(f -> !facilities.contains(f))
        .forEach(f -> facilities.add(f));
    facilities.stream()
        .forEach(
            f -> {
              Facility facility = _facilityRepo.save(f);
              facilitiesByName.put(facility.getFacilityName(), facility);
              initOktaFacility(facility);
            });

    configurePatientRegistrationLinks(_props.getPatientRegistrationLinks(), facilitiesByName);
    createPatients(_props.getPatients());
    // Abusing the class name "OrganizationInitializingService" a little, but the
    // users are in the org.
    List<DemoUser> users = _demoUserConfiguration.getAllUsers();
    configureDemoUsers(users, facilitiesByName);

    initUELRExampleData();
  }

  public void initCurrentUser() {
    // Creates current user if it doesn't already exist
    _userService.getCurrentApiUserInContainedTransaction();
  }

  public List<DeviceType> initDevices() {

    Map<String, SpecimenType> specimenTypesByCode =
        _specimenTypeRepo.findAll().stream()
            .collect(Collectors.toMap(SpecimenType::getTypeCode, s -> s));
    for (SpecimenType s : _props.getSpecimenTypes()) {
      SpecimenType specimenType = specimenTypesByCode.get(s.getTypeCode());
      if (null == specimenType) {
        log.info("Creating specimen type {}", s.getName());
        specimenType = _specimenTypeRepo.save(s);
        specimenTypesByCode.put(specimenType.getTypeCode(), _specimenTypeRepo.save(s));
      } else {
        specimenType.setCollectionLocationCode(s.getCollectionLocationCode());
        specimenType.setCollectionLocationName(s.getCollectionLocationName());
      }
    }

    Map<String, DeviceType> deviceTypesByName =
        _deviceTypeRepo.findAll().stream().collect(Collectors.toMap(DeviceType::getName, d -> d));
    for (DeviceType d : getDeviceTypes(specimenTypesByCode)) {
      if (!deviceTypesByName.containsKey(d.getName())) {
        log.info("Creating device type {}", d.getName());
        DeviceType deviceType = _deviceTypeRepo.save(d);
        deviceTypesByName.put(deviceType.getName(), deviceType);
      }
    }

    Map<String, DeviceTypeDisease> deviceExtraInfoByLoincTestkitEquipmentId =
        deviceTypeDiseaseRepository.findAll().stream()
            .collect(Collectors.toMap(d -> deviceExtraInfoKey(d), d -> d));
    for (DeviceTypeDisease d : getDeviceTypeDiseaseCode(deviceTypesByName)) {
      if (!deviceExtraInfoByLoincTestkitEquipmentId.containsKey(deviceExtraInfoKey(d))) {
        log.info("Creating device test performed loinc code {}", d.getTestPerformedLoincCode());
        DeviceTypeDisease deviceTypeDisease = deviceTypeDiseaseRepository.save(d);
        deviceExtraInfoByLoincTestkitEquipmentId.put(
            deviceTypeDisease.getTestPerformedLoincCode(), deviceTypeDisease);
      }
    }

    return new ArrayList<>(deviceTypesByName.values());
  }

  private static String deviceExtraInfoKey(DeviceTypeDisease d) {
    return d.getTestPerformedLoincCode() + d.getTestkitNameId() + d.getEquipmentUid();
  }

  private List<DeviceType> getDeviceTypes(Map<String, SpecimenType> specimenTypesByCode) {
    return _props.getDeviceTypes().stream()
        .map(
            d ->
                DeviceType.builder()
                    .name(d.getName())
                    .model(d.getModel())
                    .manufacturer(d.getManufacturer())
                    .swabTypes(
                        d.getSpecimenTypes().stream()
                            .map(specimenTypesByCode::get)
                            .collect(Collectors.toList()))
                    .testLength(Optional.ofNullable(d.getTestLength()).orElse(STANDARD_TEST_LENGTH))
                    .build())
        .collect(Collectors.toList());
  }

  private List<DeviceTypeDisease> getDeviceTypeDiseaseCode(
      Map<String, DeviceType> deviceTypesByName) {
    List<List<DeviceTypeDisease>> collect =
        _props.getDeviceTypes().stream()
            .map(
                device ->
                    device.getTestPerformedLoincs().stream()
                        .map(
                            c ->
                                DeviceTypeDisease.builder()
                                    .deviceTypeId(
                                        deviceTypesByName.get(device.getName()).getInternalId())
                                    .equipmentUid(c.getEquipmentUid())
                                    .testkitNameId(c.getTestkitNameId())
                                    .testPerformedLoincCode(c.getTestPerformedLoincCode())
                                    .supportedDisease(
                                        diseaseService.getDiseaseByName(c.getSupportedDisease()))
                                    .testOrderedLoincCode(c.getTestOrderedLoincCode())
                                    .build())
                        .collect(Collectors.toList()))
            .collect(Collectors.toList());
    return collect.stream().flatMap(List::stream).collect(Collectors.toList());
  }

  private void initOktaOrg(Organization org) {
    try {
      log.info("Creating organization {} in Okta", org.getOrganizationName());
      _oktaRepo.createOrganization(org);
    } catch (ApiException e) {
      log.info("Organization {} already exists in Okta", org.getOrganizationName());
    }
  }

  private void initOktaFacility(Facility facility) {
    try {
      log.info("Creating facility={} in Okta", facility.getFacilityName());
      _oktaRepo.createFacility(facility);
    } catch (ApiException e) {
      log.info("Facility {} already exists in Okta", facility.getFacilityName());
    }
  }

  private void initOktaUser(
      IdentityAttributes user,
      Organization org,
      Set<Facility> facilities,
      Set<OrganizationRole> roles) {
    try {
      log.info("Creating user {} in Okta", user.getUsername());
      _oktaRepo.createUser(user, org, facilities, roles, true);
    } catch (ApiException e) {
      log.info("User {} already exists in Okta", user.getUsername());
    }
  }

  private Organization setOrg(Organization o) {
    Optional<Organization> orgProbe = _orgRepo.findByExternalId(o.getExternalId());
    if (orgProbe.isPresent()) {
      return orgProbe.get();
    } else {
      log.info("Creating organization {}", o.getOrganizationName());
      return _orgRepo.save(o);
    }
  }

  private List<Facility> setFacilities(
      List<InitialSetupProperties.ConfigFacility> facilities,
      Map<String, Facility> facilitiesByName,
      Map<String, Organization> orgsByExternalId,
      Provider savedProvider,
      DeviceType defaultDeviceType,
      SpecimenType defaultSpecimenType,
      List<DeviceType> facilityDeviceTypes) {
    return facilities.stream()
        .map(
            f ->
                facilitiesByName.containsKey(f.getName())
                    ? facilitiesByName.get(f.getName())
                    : f.makeRealFacility(
                        orgsByExternalId.get(f.getOrganizationExternalId()),
                        savedProvider,
                        defaultDeviceType,
                        defaultSpecimenType,
                        facilityDeviceTypes))
        .collect(Collectors.toList());
  }

  private void configurePatientRegistrationLinks(
      List<ConfigPatientRegistrationLink> patientRegistrationLinks,
      Map<String, Facility> facilitiesByName) {
    for (ConfigPatientRegistrationLink p : patientRegistrationLinks) {
      if (_prlRepository.findByPatientRegistrationLinkIgnoreCase(p.getLink()).isEmpty()) {
        String orgExternalId = p.getOrganizationExternalId();
        String facilityName = p.getFacilityName();
        if (null != orgExternalId) {
          createPatientSelfRegistrationLinkWithOrg(p, orgExternalId);
        } else if (null != p.getFacilityName()) {
          createPatientSelfRegistrationLinkWithFacility(p, facilityName, facilitiesByName);
        }
      }
    }
  }

  private void configureDemoUsers(List<DemoUser> users, Map<String, Facility> facilitiesByName) {
    for (DemoUser user : users) {
      IdentityAttributes identity = user.getIdentity();
      Optional<ApiUser> userProbe = _apiUserRepo.findByLoginEmail(identity.getUsername());
      ApiUser apiUser =
          userProbe.orElseGet(
              () -> _apiUserRepo.save(new ApiUser(identity.getUsername(), identity)));
      DemoAuthorization authorization = user.getAuthorization();
      if (authorization != null) {
        Set<OrganizationRole> roles = authorization.getGrantedRoles();
        Organization org =
            _orgRepo
                .findByExternalId(authorization.getOrganizationExternalId())
                .orElseThrow(MisconfiguredUserException::new);
        apiUser.setRoles(roles, org);
        log.info(
            "User={} will have roles={} in organization={}",
            identity.getUsername(),
            roles,
            authorization.getOrganizationExternalId());
        Set<Facility> authorizedFacilities =
            authorization.getFacilities().stream()
                .map(
                    f -> {
                      Facility facility = facilitiesByName.get(f);
                      if (facility == null) {
                        throw new UserFacilityNotInitializedException(
                            f, facilitiesByName.keySet().toString());
                      }
                      return facility;
                    })
                .collect(Collectors.toSet());
        if (PermissionHolder.grantsAllFacilityAccess(roles)) {
          log.info(
              "User={} will have access to all facilities in organization={}",
              identity.getUsername(),
              authorization.getOrganizationExternalId());
        } else {
          apiUser.setFacilities(authorizedFacilities);
          log.info(
              "User={} will have access to facilities={} in organization={}",
              identity.getUsername(),
              authorization.getFacilities(),
              authorization.getOrganizationExternalId());
        }

        initOktaUser(identity, org, authorizedFacilities, roles);
      }
    }
  }

  private void savePatientSelfRegistrationLink(
      ConfigPatientRegistrationLink p, PatientSelfRegistrationLink prl) {
    log.info("Creating patient registration link {}", p.getLink());
    _prlRepository.save(prl);
  }

  private void createPatientSelfRegistrationLinkWithFacility(
      ConfigPatientRegistrationLink p,
      String facilityName,
      Map<String, Facility> facilitiesByName) {
    Facility facility = facilitiesByName.get(facilityName);
    if (null == facility) {
      return;
    }

    Optional<PatientSelfRegistrationLink> link = _prlRepository.findByFacility(facility);

    if (!link.isPresent()) {
      PatientSelfRegistrationLink prl = p.makePatientRegistrationLink(facility, p.getLink());
      savePatientSelfRegistrationLink(p, prl);
    }
  }

  private void createPatientSelfRegistrationLinkWithOrg(
      ConfigPatientRegistrationLink p, String orgExternalId) {
    Optional<Organization> orgLookup = _orgRepo.findByExternalId(orgExternalId);

    if (!orgLookup.isPresent()) {
      return;
    }

    Organization org = orgLookup.get();
    Optional<PatientSelfRegistrationLink> link = _prlRepository.findByOrganization(org);

    if (!link.isPresent()) {
      PatientSelfRegistrationLink prl = p.makePatientRegistrationLink(org, p.getLink());
      savePatientSelfRegistrationLink(p, prl);
    }
  }

  public void createPatients(List<ConfigPatient> patients) {
    if (patients != null && !patients.isEmpty()) {
      for (ConfigPatient p : patients) {
        Optional<Organization> orgLookup = _orgRepo.findByExternalId(p.getOrganizationExternalId());

        if (!orgLookup.isPresent()) {
          return;
        }

        Organization org = orgLookup.get();
        String fullName = String.format("%s %s", p.getFirstName(), p.getLastName());
        Optional<Person> foundPatient =
            _personRepository.findAll().stream()
                .filter(
                    fp ->
                        fp.getLastName().equals(p.getLastName())
                            && fp.getFirstName().equals(p.getFirstName()))
                .findFirst();
        if (foundPatient.isEmpty()) {
          Person createdPatient =
              p.makePatient(org, p.getFirstName(), p.getLastName(), p.getBirthDate());
          log.info(String.format("Creating patient: %s with DOB %s", fullName, p.getBirthDate()));
          _personRepository.save(createdPatient);
        }
      }
    }
  }

  public void initUELRExampleData() {

    if (_props.getConditions() != null && _props.getSpecimens() != null) {
      List<Condition> newConditionsToSave =
          _props.getConditions().stream()
              .filter(
                  condition -> conditionRepository.findConditionByCode(condition.getCode()) == null)
              .collect(Collectors.toCollection(ArrayList::new));

      List<Lab> newLabsToSave =
          _props.getConditions().stream()
              .flatMap(condition -> condition.getLabs().stream())
              .filter(lab -> labRepository.findByCode(lab.getCode()).isEmpty())
              .collect(Collectors.toCollection(ArrayList::new));

      List<Specimen> newSpecimensToSave =
          _props.getSpecimens().stream()
              .filter(
                  specimen ->
                      specimenRepository.findByLoincSystemCodeAndSnomedCode(
                              specimen.getLoincSystemCode(), specimen.getSnomedCode())
                          == null)
              .collect(Collectors.toCollection(ArrayList::new));

      List<SpecimenBodySite> newSpecimenBodySitesToSave =
          _props.getSpecimens().stream()
              .flatMap(specimen -> specimen.getBodySiteList().stream())
              .filter(
                  specimen ->
                      specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
                              specimen.getSnomedSpecimenCode(), specimen.getSnomedSiteCode())
                          == null)
              .collect(Collectors.toCollection(ArrayList::new));

      conditionRepository.saveAll(newConditionsToSave);
      labRepository.saveAll(newLabsToSave);
      specimenRepository.saveAll(newSpecimensToSave);
      specimenBodySiteRepository.saveAll(newSpecimenBodySitesToSave);
    }
  }
}
