package gov.cdc.usds.simplereport.test_util;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;

@Component
public class TestDataFactory {

	@Autowired
	private OrganizationRepository _orgRepo;
	@Autowired
	private PersonRepository _personRepo;
	@Autowired
	private ProviderRepository _providerRepo;
	@Autowired
	private DeviceTypeRepository _deviceRepo;

	public Organization createValidOrg() {
		DeviceType dev = _deviceRepo.save(new DeviceType("Acme SuperFine", "Acme", "SFN"));
		StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
		Provider doc = _providerRepo.save(new Provider("Doctor", "", "Doom", "", "DOOOOOOM", addy, "1-900-CALL-FOR-DOC")); 
		return _orgRepo.save(new Organization("The Mall", "MALLRAT", dev, doc));
	}

	public Person createMinimalPerson(Organization org) {
		return _personRepo.save(new Person("John", "Brown", "Boddie", "Jr.", org));
	}
}
