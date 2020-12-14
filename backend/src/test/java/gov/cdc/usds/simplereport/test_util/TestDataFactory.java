package gov.cdc.usds.simplereport.test_util;

import java.time.LocalDate;
import java.util.Collections;

import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;

@Component
public class TestDataFactory {

	private static final String DEFAULT_DEVICE_TYPE = "Acme SuperFine";
	@Autowired
	private OrganizationRepository _orgRepo;
	@Autowired
	private FacilityRepository _facilityRepo;
	@Autowired
	private PersonRepository _personRepo;
	@Autowired
	private ProviderRepository _providerRepo;
	@Autowired
	private DeviceTypeRepository _deviceRepo;
    @Autowired
    private TestOrderRepository _testOrderRepo;
    @Autowired
    private PatientAnswersRepository _patientAnswerRepo;

	public Organization createValidOrg() {
		return _orgRepo.save(new Organization("The Mall", "MALLRAT"));
	}

	public Facility createValidFacility(Organization org) {
		DeviceType dev = getGenericDevice();
		StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
		Provider doc = _providerRepo.save(new Provider("Doctor", "", "Doom", "", "DOOOOOOM", addy, "1-900-CALL-FOR-DOC")); 
		Facility facility = new Facility(org, "Injection Site", "123456", doc);
		facility.setAddress(addy);
		facility.setDefaultDeviceType(dev);
		Facility save = _facilityRepo.save(facility);
		LoggerFactory.getLogger("DERPDERPDERP").warn("Facility looks like {}", save);
		return save;
	}

	public Person createMinimalPerson(Organization org) {
        return createMinimalPerson(org, "John", "Brown", "Boddie", "Jr.");
	}

    public Person createMinimalPerson(Organization org, String firstName, String middleName, String lastName,
            String suffix) {
        return _personRepo.save(new Person(firstName, middleName, lastName, suffix, org));
    }

	public Person createFullPerson(Organization org) {
		Person p = new Person(
			org, "HELLOTHERE", "Fred", null, "Astaire", null, LocalDate.of(1899, 5, 10),
			new StreetAddress("1 Central Park West", null, "New York", "NY", "11000", "New Yawk"), "202-123-4567",
			PersonRole.RESIDENT, null,
			"W", null, "M", false, false
		);
		return _personRepo.save(p);
	}

    public TestOrder createTestOrder(Person p, Facility f) {
        AskOnEntrySurvey survey = new AskOnEntrySurvey(null,Collections.emptyMap(),null,null,null,null,null,null);
        PatientAnswers answers = new PatientAnswers(survey);
        _patientAnswerRepo.save(answers);
        TestOrder o = new TestOrder(p, f);
        o.setAskOnEntrySurvey(answers);
        return _testOrderRepo.save(o);
    }

	public DeviceType getGenericDevice() {
		return _deviceRepo.findAll().stream().filter(d->d.getName().equals(DEFAULT_DEVICE_TYPE)).findFirst()
			.orElseGet(()->_deviceRepo.save(new DeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", "54321-BOOM")));
	}
}
