package gov.cdc.usds.simplereport.service;

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
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;

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
	private FacilityRepository _facilityRepo;

	public void initAll() {
		LOG.debug("Organization init called (again?)");
		Organization emptyOrg = _props.getOrganization();
		Optional<Organization> probe = _orgRepo.findByExternalId(emptyOrg.getExternalId());
		if (probe.isPresent()) {
			return; // one and done
		}
		Provider savedProvider = _providerRepo.save(_props.getProvider());
		Map<String, DeviceType> byName = _deviceTypeRepo.findAll().stream().collect(
				Collectors.toMap(d->d.getName(), d->d));
		for (DeviceType d : _props.getDeviceTypes()) {
			DeviceType deviceType = byName.get(d.getName());
			if (null == deviceType) {
				LOG.info("Creating device {}", d.getName());
				deviceType = _deviceTypeRepo.save(d);
				byName.put(deviceType.getName(), deviceType);
			}
		}
		List<DeviceType> configured= _props.getConfiguredDeviceTypeNames().stream()
				.map(name->byName.get(name))
				.collect(Collectors.toList());
		DeviceType defaultDeviceType = configured.get(0);
		LOG.info("Creating organization {}", emptyOrg.getOrganizationName());
		Organization realOrg = _orgRepo.save(emptyOrg);
		Facility defaultFacility = _props.getFacility().makeRealFacility(realOrg, savedProvider, defaultDeviceType, configured);
		LOG.info("Creating facility {} with {} devices configured", defaultFacility.getFacilityName(), configured.size());
		_facilityRepo.save(defaultFacility);
	}

	public String getDefaultOrganizationId() {
		return _props.getOrganization().getExternalId();
	}
}
