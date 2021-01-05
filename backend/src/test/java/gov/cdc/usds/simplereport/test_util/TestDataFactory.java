package gov.cdc.usds.simplereport.test_util;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.db.repository.OrganizationRepository;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;

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
    private TestEventRepository _testEventRepo;
    @Autowired
    private PatientAnswersRepository _patientAnswerRepo;

    public Organization createValidOrg() {
        return _orgRepo.save(new Organization("The Mall", "MALLRAT"));
    }

    public Facility createValidFacility(Organization org) {
        return createValidFacility(org, "Injection Site");
    }

    public Facility createValidFacility(Organization org, String facilityName) {
        DeviceType dev = getGenericDevice();
        List<DeviceType> configuredDevices = new ArrayList<>();
        configuredDevices.add(dev);
        StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
        Provider doc = _providerRepo.save(new Provider("Doctor", "", "Doom", "", "DOOOOOOM", addy, "800-555-1212"));
        Facility facility = new Facility(org, facilityName, "123456", addy, "555-867-5309", "facility@test.com", doc,
                dev, configuredDevices);
        Facility save = _facilityRepo.save(facility);
        return save;
    }

    public Person createMinimalPerson(Organization org) {
        return createMinimalPerson(org, null, "John", "Brown", "Boddie", "Jr.");
    }

    public Person createMinimalPerson(Organization org, Facility fac, String firstName, String middleName, String lastName,
            String suffix) {
        PersonName names = new PersonName(firstName, middleName, lastName, suffix);
        return createMinimalPerson(org, fac, names);
    }

    public Person createMinimalPerson(Organization org, Facility fac, PersonName names) {
        Person p = new Person(names, org, fac);
        return _personRepo.save(p);
    }

    public Person createFullPerson(Organization org) {
        // consts are to keep style check happy othewise it complains about
        // "magic numbers"
        final int BIRTH_YEAR = 1899;
        final int BIRTH_MONTH = 5;
        final int BIRTH_DAY = 10;
        Person p = new Person(
                org, "HELLOTHERE", "Fred", null, "Astaire", null, LocalDate.of(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY),
                new StreetAddress("1 Central Park West", null, "New York", "NY", "11000", "New Yawk"), "202-123-4567",
                PersonRole.RESIDENT, null,
                "W", null, "M", false, false);
        return _personRepo.save(p);
    }

    public TestOrder createTestOrder(Person p, Facility f) {
        AskOnEntrySurvey survey = new AskOnEntrySurvey(null, Collections.emptyMap(), null, null, null, null, null,
                null);
        PatientAnswers answers = new PatientAnswers(survey);
        _patientAnswerRepo.save(answers);
        TestOrder o = new TestOrder(p, f);
        o.setAskOnEntrySurvey(answers);
        return _testOrderRepo.save(o);
    }

    public TestEvent createTestEvent(Person p, Facility f) {
        TestOrder o = createTestOrder(p, f);
        o.setResult(TestResult.NEGATIVE);

        TestEvent e = _testEventRepo.save(new TestEvent(o));
        o.setTestEvent(e);
        o.markComplete();
        _testOrderRepo.save(o);
        return e;
    }

    public DeviceType getGenericDevice() {
        return _deviceRepo.findAll().stream().filter(d -> d.getName().equals(DEFAULT_DEVICE_TYPE)).findFirst()
                .orElseGet(() -> _deviceRepo.save(new DeviceType(DEFAULT_DEVICE_TYPE, "Acme", "SFN", "54321-BOOM")));
    }
}
