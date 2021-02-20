package gov.cdc.usds.simplereport.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimen;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

import com.okta.sdk.resource.ResourceException;

@Service
@Transactional
public class OrganizationInitializingService {

	private static final Logger LOG = LoggerFactory.getLogger(OrganizationInitializingService.class);

	@Autowired
	private InitialSetupProperties _props;
	@Autowired
	private OrganizationRepository _orgRepo;
	@Autowired
	private ProviderRepository _providerRepo;
	@Autowired
	private DeviceTypeRepository _deviceTypeRepo;
	@Autowired
    private SpecimenTypeRepository _specimenTypeRepo;
    @Autowired
    private DeviceSpecimenRepository _deviceSpecimenRepo;
    @Autowired
	private FacilityRepository _facilityRepo;
	@Autowired
	private ApiUserRepository _apiUserRepo;
	@Autowired
	private OktaRepository _oktaRepo;
	@Autowired
	private ApiUserService _userService;
	@Autowired
	private DemoUserConfiguration _demoUserConfiguration;

	public void initAll() {
		// Creates current user to allow audited creation of other entities below
		initAuditor();

		LOG.debug("Organization init called (again?)");
		Organization emptyOrg = _props.getOrganization();
		Optional<Organization> probe = _orgRepo.findByExternalId(emptyOrg.getExternalId());
		if (probe.isPresent()) {
			return; // one and done
		}
		Provider savedProvider = _providerRepo.save(_props.getProvider());
		Map<String, DeviceType> byName = _deviceTypeRepo.findAll().stream().collect(
				Collectors.toMap(d->d.getName(), d->d));
        Map<String, SpecimenType> specimenTypesByName = _specimenTypeRepo.findAll().stream().collect(
                Collectors.toMap(s -> s.getName(), s -> s));
        Map<String, SpecimenType> specimenTypesByCode = new HashMap<>();
        for (SpecimenType s : _props.getSpecimenTypes()) {
            SpecimenType specimenType = specimenTypesByName.get(s.getName());
            if (null == specimenType) {
                LOG.info("Creating device {}", s.getName());
                specimenType = _specimenTypeRepo.save(s);
            }
            specimenTypesByCode.put(specimenType.getTypeCode(), specimenType);
        }

        Map<String, DeviceSpecimen> dsForDeviceName = new HashMap<>();
        for (DeviceType d : _props.getDeviceTypes()) {
			DeviceType deviceType = byName.get(d.getName());
			if (null == deviceType) {
				LOG.info("Creating device {}", d.getName());
				deviceType = _deviceTypeRepo.save(d);
				byName.put(deviceType.getName(), deviceType);
			}
            SpecimenType defaultTypeForDevice = specimenTypesByCode.get(deviceType.getSwabType());
            if (defaultTypeForDevice == null) {
                throw new RuntimeException("specimen type " + deviceType.getSwabType() + " was not initialized");
            }
            Optional<DeviceSpecimen> deviceSpecimen = _deviceSpecimenRepo.find(deviceType, defaultTypeForDevice);
            if (deviceSpecimen.isEmpty()) {
                dsForDeviceName.put(deviceType.getName(),
                        _deviceSpecimenRepo.save(new DeviceSpecimen(deviceType, defaultTypeForDevice)));
            } else {
                dsForDeviceName.put(deviceType.getName(), deviceSpecimen.get());
            }
		}

        List<DeviceSpecimen> configured = _props.getConfiguredDeviceTypeNames().stream()
                .map(dsForDeviceName::get)
				.collect(Collectors.toList());
        DeviceSpecimen defaultDeviceSpecimen = configured.get(0);

		LOG.info("Creating organization {}", emptyOrg.getOrganizationName());
		Organization realOrg = _orgRepo.save(emptyOrg);
		// in the unlikely event DB and Okta fall out of sync
		initOktaOrg(realOrg);
        Facility defaultFacility = _props.getFacility().makeRealFacility(realOrg, savedProvider,
                defaultDeviceSpecimen, configured);
        LOG.info("Creating facility {} with {} devices configured", defaultFacility.getFacilityName(),
                configured.size());
		_facilityRepo.save(defaultFacility);

		// Abusing the class name "OrganizationInitializingService" a little, but the users are in the org.
		List<IdentityAttributes> users = _demoUserConfiguration.getAlternateUsers().stream()
				.map(DemoUserConfiguration.DemoUser::getIdentity).collect(Collectors.toList());
		for (IdentityAttributes user : users) {
			_apiUserRepo.save(new ApiUser(user.getUsername(), user));
			initOktaUser(user, emptyOrg);
		}
	}

	public void initAuditor() {
		// Creates current user if it doesn't already exist
		_userService.getCurrentUser();
	}

	private void initOktaOrg(Organization org) {
		try {
			LOG.info("Creating organization {} in Okta", org.getOrganizationName());
			_oktaRepo.createOrganization(org.getOrganizationName(), org.getExternalId());
		} catch (ResourceException e) {
			LOG.info("Organization {} already exists in Okta", org.getOrganizationName());
		}
	}

	private void initOktaUser(IdentityAttributes user, Organization org) {
		try {
			LOG.info("Creating user {} in Okta", user.getUsername());
			_oktaRepo.createUser(user, org);
		} catch (ResourceException e) {
			LOG.info("User {} already exists in Okta", user.getUsername());
		}
	}

	public Organization getDefaultOrganization() {
		return _props.getOrganization();
	}
}
