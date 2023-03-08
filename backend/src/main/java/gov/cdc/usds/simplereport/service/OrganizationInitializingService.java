package gov.cdc.usds.simplereport.service;

import com.okta.sdk.resource.ResourceException;
import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties.ConfigPatientRegistrationLink;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoAuthorization;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTestPerformedLoincCodeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientRegistrationLinkRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
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
  private final DeviceTestPerformedLoincCodeRepository deviceTestPerformedLoincCodeRepository;
  private final FacilityRepository _facilityRepo;
  private final ApiUserRepository _apiUserRepo;
  private final OktaRepository _oktaRepo;
  private final ApiUserService _userService;
  private final DemoUserConfiguration _demoUserConfiguration;
  private final PatientRegistrationLinkRepository _prlRepository;
  private final DiseaseService diseaseService;

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
            .map(
                o -> {
                  Optional<Organization> orgProbe = _orgRepo.findByExternalId(o.getExternalId());
                  if (orgProbe.isPresent()) {
                    return orgProbe.get();
                  } else {
                    log.info("Creating organization {}", o.getOrganizationName());
                    return _orgRepo.save(o);
                  }
                })
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
        _props.getFacilities().stream()
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

    for (ConfigPatientRegistrationLink p : _props.getPatientRegistrationLinks()) {
      String orgExternalId = p.getOrganizationExternalId();
      String facilityName = p.getFacilityName();
      if (null != orgExternalId) {
        Optional<Organization> orgLookup = _orgRepo.findByExternalId(orgExternalId);
        if (!orgLookup.isPresent()) {
          continue;
        }
        Organization org = orgLookup.get();
        Optional<PatientSelfRegistrationLink> link = _prlRepository.findByOrganization(org);
        if (!link.isPresent()) {
          log.info("Creating patient registration link {}", p.getLink());
          PatientSelfRegistrationLink prl =
              p.makePatientRegistrationLink(orgsByExternalId.get(orgExternalId), p.getLink());
          _prlRepository.save(prl);
        }
      } else if (null != p.getFacilityName()) {
        Facility facility = facilitiesByName.get(facilityName);
        if (null == facility) {
          continue;
        }
        Optional<PatientSelfRegistrationLink> link = _prlRepository.findByFacility(facility);
        if (!link.isPresent()) {
          log.info("Creating patient registration link {}", p.getLink());
          PatientSelfRegistrationLink prl = p.makePatientRegistrationLink(facility, p.getLink());
          _prlRepository.save(prl);
        }
      }
    }

    // Abusing the class name "OrganizationInitializingService" a little, but the
    // users are in the org.
    List<DemoUser> users = _demoUserConfiguration.getAllUsers();
    for (DemoUser user : users) {
      IdentityAttributes identity = user.getIdentity();
      Optional<ApiUser> userProbe = _apiUserRepo.findByLoginEmail(identity.getUsername());
      if (!userProbe.isPresent()) {
        _apiUserRepo.save(new ApiUser(identity.getUsername(), identity));
      }
      DemoAuthorization authorization = user.getAuthorization();
      if (authorization != null) {
        Set<OrganizationRole> roles = authorization.getGrantedRoles();
        Organization org =
            _orgRepo
                .findByExternalId(authorization.getOrganizationExternalId())
                .orElseThrow(MisconfiguredUserException::new);
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
                        throw new RuntimeException(
                            "User's facility="
                                + f
                                + " was not initialized. Valid facilities="
                                + facilitiesByName.keySet().toString());
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

    Map<String, DeviceTestPerformedLoincCode> deviceExtraInfoByLoinc =
        deviceTestPerformedLoincCodeRepository.findAll().stream()
            .collect(
                Collectors.toMap(DeviceTestPerformedLoincCode::getTestPerformedLoincCode, d -> d));
    for (DeviceTestPerformedLoincCode d : getDeviceTestPerformedLoincCode(deviceTypesByName)) {
      if (!deviceExtraInfoByLoinc.containsKey(d.getTestPerformedLoincCode())) {
        log.info("Creating device test performed loinc code {}", d.getTestPerformedLoincCode());
        DeviceTestPerformedLoincCode deviceTestPerformedLoincCode =
            deviceTestPerformedLoincCodeRepository.save(d);
        deviceExtraInfoByLoinc.put(
            deviceTestPerformedLoincCode.getTestPerformedLoincCode(), deviceTestPerformedLoincCode);
      }
    }

    return new ArrayList<>(deviceTypesByName.values());
  }

  private List<DeviceType> getDeviceTypes(Map<String, SpecimenType> specimenTypesByCode) {
    return _props.getDeviceTypes().stream()
        .map(
            d ->
                DeviceType.builder()
                    .name(d.getName())
                    .model(d.getModel())
                    .manufacturer(d.getManufacturer())
                    .loincCode(
                        d.getTestPerformedLoincs().stream()
                            .filter(t -> "COVID-19".equals(t.getSupportedDisease()))
                            .map(
                                InitialSetupProperties.ConfigSupportedDiseaseTestPerformed
                                    ::getTestPerformedLoincCode)
                            .findFirst()
                            .orElseThrow())
                    .swabTypes(
                        d.getSpecimenTypes().stream()
                            .map(specimenTypesByCode::get)
                            .collect(Collectors.toList()))
                    .testLength(Optional.ofNullable(d.getTestLength()).orElse(STANDARD_TEST_LENGTH))
                    .build())
        .collect(Collectors.toList());
  }

  private List<DeviceTestPerformedLoincCode> getDeviceTestPerformedLoincCode(
      Map<String, DeviceType> deviceTypesByName) {
    List<List<DeviceTestPerformedLoincCode>> collect =
        _props.getDeviceTypes().stream()
            .map(
                device ->
                    device.getTestPerformedLoincs().stream()
                        .map(
                            c ->
                                DeviceTestPerformedLoincCode.builder()
                                    .deviceTypeId(
                                        deviceTypesByName.get(device.getName()).getInternalId())
                                    .equipmentUid(c.getEquipmentUid())
                                    .testkitNameId(c.getTestkitNameId())
                                    .testPerformedLoincCode(c.getTestPerformedLoincCode())
                                    .supportedDisease(
                                        diseaseService.getDiseaseByName(c.getSupportedDisease()))
                                    .build())
                        .collect(Collectors.toList()))
            .collect(Collectors.toList());
    return collect.stream().flatMap(List::stream).collect(Collectors.toList());
  }

  private void initOktaOrg(Organization org) {
    try {
      log.info("Creating organization {} in Okta", org.getOrganizationName());
      _oktaRepo.createOrganization(org);
    } catch (ResourceException e) {
      log.info("Organization {} already exists in Okta", org.getOrganizationName());
    }
  }

  private void initOktaFacility(Facility facility) {
    try {
      log.info("Creating facility={} in Okta", facility.getFacilityName());
      _oktaRepo.createFacility(facility);
    } catch (ResourceException e) {
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
    } catch (ResourceException e) {
      log.info("User {} already exists in Okta", user.getUsername());
    }
  }
}
