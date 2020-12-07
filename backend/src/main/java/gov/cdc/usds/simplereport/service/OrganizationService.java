package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;

@Service
@Transactional(readOnly=false)
public class OrganizationService {

	private OrganizationRepository _repo;
	private OrganizationInitializingService _initService;
	private FacilityRepository _facilityRepo;

	public OrganizationService(OrganizationRepository repo,
			FacilityRepository facilityRepo,
			OrganizationInitializingService initService) {
		_repo = repo;
		_facilityRepo = facilityRepo;
		_initService = initService;
	}

	public Organization getCurrentOrganization() {
    	_initService.initAll();
		Optional<Organization> maybe = _repo.findByExternalId(_initService.getDefaultOrganizationId());
		if (maybe.isPresent()) {
			return maybe.get();
		} else {
			throw new RuntimeException("Default organization not found: serious troubles");
		}
	}

	public Facility getDefaultFacility(Organization org) {
		return _facilityRepo.findFirstByOrganizationOrderByCreatedAt(org)
			.orElseThrow();
	}
	public Organization updateFacility(
		String testingFacilityName,
		String cliaNumber,
		String street,
		String streetTwo,
		String city,
		String county,
		String state,
		String zipCode,
		String phone,
		String orderingProviderFirstName,
		String orderingProviderMiddleName,
		String orderingProviderLastName,
		String orderingProviderSuffix,
		String orderingProviderNPI,
		String orderingProviderStreet,
		String orderingProviderStreetTwo,
		String orderingProviderCity,
		String orderingProviderCounty,
		String orderingProviderState,
		String orderingProviderZipCode,
		String orderingProviderTelephone,
		List<DeviceType> devices,
		DeviceType defaultDeviceType
	) {
		Organization org = this.getCurrentOrganization();
		Facility facility = getDefaultFacility(org);
		facility.setFacilityName(testingFacilityName);
		facility.setCliaNumber(cliaNumber);
		facility.setTelephone(phone);
		facility.addDefaultDeviceType(defaultDeviceType);
		StreetAddress af = facility.getAddress() == null ? new StreetAddress(
			street,
			streetTwo,
			city,
			county,
			state,
			zipCode
		 ) : facility.getAddress();
		 af.setStreet(street, streetTwo);
		 af.setCity(city);
		 af.setCounty(county);
		 af.setState(state);
		 af.setPostalCode(zipCode);

		Provider p = facility.getOrderingProvider();
		p.getNameInfo().setFirstName(orderingProviderFirstName);
		p.getNameInfo().setMiddleName(orderingProviderMiddleName);
		p.getNameInfo().setLastName(orderingProviderLastName);
		p.getNameInfo().setSuffix(orderingProviderSuffix);
		p.setProviderId(orderingProviderNPI);
		p.setTelephone(orderingProviderTelephone);

		StreetAddress a = p.getAddress() == null ? new StreetAddress(
			orderingProviderStreet,
			orderingProviderStreetTwo,
			orderingProviderCity,
			orderingProviderState,
			orderingProviderZipCode,
			orderingProviderCounty
		 ) : p.getAddress();
		a.setStreet(orderingProviderStreet, orderingProviderStreetTwo);
		a.setCity(orderingProviderCity);
		a.setCounty(orderingProviderCounty);
		a.setState(orderingProviderState);
		a.setPostalCode(orderingProviderZipCode);

		// remove all existing devices
		for(DeviceType d : facility.getDeviceTypes()) {
			facility.removeDeviceType(d);
		}

		// add new devices
		for(DeviceType d : devices) {
			facility.addDeviceType(d);
		}
		facility.setDefaultDeviceType(defaultDeviceType);
		return _repo.save(org);

	}

	public Organization updateOrganization(String name) {
		Organization org = this.getCurrentOrganization();
		org.setOrganizationName(name);
		return _repo.save(org);
	}

}
