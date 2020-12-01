package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;

public class TestEventExport {

	private TestEvent testEvent;
	private Person patient;
	private AskOnEntrySurvey survey;
	private Provider provider;
	private Organization org;

	public TestEventExport(TestEvent testEvent) {
		super();
		this.testEvent = testEvent;
		this.patient = testEvent.getPatientData();
		this.survey = testEvent.getTestOrder().getAskOnEntrySurvey().getSurvey();
		this.provider = testEvent.getProviderData();
		this.org = testEvent.getOrganization();
	}

	// values pulled from https://github.com/CDCgov/prime-data-hub/blob/master/prime-router/metadata/valuesets/common.valuesets
	private Map<String, String> genderMap = Map.of(
		"male", "M",
		"female", "F",
		"other", "O"
	);

	private Map<String, String> ethnicityMap = Map.of(
		"hispanic", "H",
		"not_hispanic", "N"
	);

	private Map<TestResult, String> testResultMap = Map.of(
		TestResult.POSITIVE, "260373001",
		TestResult.NEGATIVE, "260415000",
		TestResult.UNDETERMINED, "419984006"
	);


	private String boolToYesNoUnk(Boolean value) {
		if (value == null) {
			return "UNK";
		} else if (value) {
			return "Y";
		} else {
			return "N";
		}
	}

	private String arrayToString(List<String> value) {
		if (value == null) {
			return "";
		}
		if (value.size() < 1) {
			return "";
		}
		return String.join(",", value);
	}

	private String dateToHealthCareString(LocalDate value) {
		if (value == null) {
			return "";
		}
		return value.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
	}

	private LocalDate convertToLocalDate(Date dateToConvert) {
		return dateToConvert.toInstant()
			.atZone(ZoneId.systemDefault())
			.toLocalDate();
	}

	@JsonProperty("Patient_last_name")
	public String getPatientLastName() {
		return patient.getLastName();
	}

	@JsonProperty("Patient_first_name")
	public String getPatientFirstName() {
		return patient.getFirstName();
	}

	@JsonProperty("Patient_middle_name")
	public String getPatientMiddleName() {
		return patient.getMiddleName();
	}

	@JsonProperty("Patient_suffix")
	public String getPatientSuffix() {
		return patient.getSuffix();
	}

	@JsonProperty("Patient_race")
	public String getPatientRace() {
		return arrayToString(patient.getRace());
	}

	@JsonProperty("Patient_DOB")
	public String getPatientBirthDate() {
		return dateToHealthCareString(patient.getBirthDate());
	}

	@JsonProperty("Patient_gender")
	public String getPatientGender() {
		if (patient.getGender() == null) {
			return "UNK";
		}
		return patient.getGender();
	}

	@JsonProperty("Patient_ethnicity")
	public String getPatientEthnicity() {
		if (patient.getEthnicity() == null) {
			return "U";
		}
		return ethnicityMap.get(patient.getEthnicity());
	}

	@JsonProperty("Patient_street")
	public String getPatientStreet() {
		return patient.getStreet();
	}

	@JsonProperty("Patient_street2")
	public String getPatientStreetTwo() {
		return patient.getStreetTwo();
	}

	@JsonProperty("Patient_city")
	public String getPatientCity() {
		return patient.getCity();
	}

	@JsonProperty("Patient_county")
	public String getPatientCounty() {
		return patient.getCounty();
	}

	@JsonProperty("Patient_state")
	public String getPatientState() {
		return patient.getState();
	}

	@JsonProperty("Patient_zip_code")
	public String getPatientZipCode() {
		return patient.getZipCode();
	}

	@JsonProperty("Patient_phone_number")
	public String getPatientPhoneNumber() {
		return patient.getTelephone();
	}

	@JsonProperty("Patient_lookup_ID")
	public String getPatientLookupId() {
		return patient.getLookupId();
	}

	@JsonProperty("Patient_ID")
	public String getPatientId() {
		return patient.getInternalId().toString();
	}

	@JsonProperty("Employed_in_healthcare")
	public String getPatientEmployedInHealthcare() {
		return boolToYesNoUnk(patient.getEmployedInHealthcare());
	}

	@JsonProperty("Resident_congregate_setting")
	public String getPatientResidentCongregateSetting() {
		return boolToYesNoUnk(patient.getResidentCongregateSetting());
	}

	@JsonProperty("Testing_lab_specimen_ID")
	public String getTestingLabSpecimenID() {
		return testEvent.getInternalId().toString();
	}

	@JsonProperty("Test_result_code")
	public String getTestResult() {
		return testResultMap.get(testEvent.getResult());
	}

	@JsonProperty("Specimen_collection_date_time")
	public String getSpecimenCollectionDateTime() {
		return testEvent.getCreatedAt().toString();
	}

	@JsonProperty("Ordering_provider_ID")
	public String getOrderingProviderID() {
		return provider.getProviderId();
	}

	@JsonProperty("First_test")
	public String getFirstTest() {
		return boolToYesNoUnk(survey.getFirstTest());
	}

	@JsonProperty("Symptomatic_for_disease")
	public String getSymptomaticForDisease() {
		return boolToYesNoUnk(!survey.getNoSymptoms());
	}

	@JsonProperty("Testing_lab_name")
	public String getTestingLabName() {
		return org.getFacilityName();
	}

	@JsonProperty("Testing_lab_CLIA")
	public String getTestingLabID() {
		return org.getCliaNumber();
	}

	@JsonProperty("Testing_lab_state")
	public String getTestingLabState() {
		return provider.getState();
	}

	@JsonProperty("Testing_lab_street")
	public String getTestingLabStreet() {
		return provider.getStreet();
	}

	@JsonProperty("Testing_lab_street2")
	public String getTestingLabStreetTwo() {
		return provider.getStreetTwo();
	}

	@JsonProperty("Testing_lab_zip_code")
	public String getTestingLabZipCode() {
		return provider.getZipCode();

	}

	@JsonProperty("Testing_lab_phone_number")
	public String getTestingLabPhoneNumber() {
		return provider.getTelephone();
	}

	@JsonProperty("Testing_lab_city")
	public String getTestingLabCity() {
		return provider.getCity();
	}

	@JsonProperty("Ordering_facility_city")
	public String getOrderingFacilityCity() {
		return this.getTestingLabCity();
	}

	@JsonProperty("Ordering_facility_county")
	public String getOrderingFacilityCounty() {
		return provider.getCounty();
	}

	@JsonProperty("Ordering_facility_name")
	public String getOrderingFacilityName() {
		return org.getTestingFacilityName();
	}

	@JsonProperty("Ordering_facility_phone_number")
	public String getOrderingFacilityPhoneNumber() {
		return this.getTestingLabPhoneNumber();
	}

	@JsonProperty("Ordering_facility_state")
	public String getOrderingFacilityState() {
		return this.getTestingLabState();
	}

	@JsonProperty("Ordering_facility_street")
	public String getOrderingFacilityStreet() {
		return this.getTestingLabStreet();
	}

	@JsonProperty("Ordering_facility_street_2")
	public String getOrderingFacilityStreet_2() {
		return this.getTestingLabStreetTwo();
	}

	@JsonProperty("Ordering_facility_zip_code")
	public String getOrderingFacilityZipCode() {
		return this.getTestingLabZipCode();
	}

	@JsonProperty("Ordering_provider_last_name")
	public String getOrderingProviderLastName() {
		return provider.getNameInfo().getLastName();
	}

	@JsonProperty("Ordering_provider_first_name")
	public String getOrderingProviderFirstName() {
		return provider.getNameInfo().getFirstName();
	}

	@JsonProperty("Ordering_provider_street")
	public String getOrderingProviderStreet() {
		return this.getTestingLabStreet();
	}

	@JsonProperty("Ordering_provider_zip_code")
	public String getOrderingProviderZipCode() {
		return this.getTestingLabZipCode();
	}

	@JsonProperty("Ordering_provider_phone_number")
	public String getOrderingProviderPhoneNumber() {
		return this.getTestingLabPhoneNumber();
	}

	@JsonProperty("Ordered_test_code")
	public String getOrderedTestCode() {
		return testEvent.getDeviceType().getLoincCode();
	}

	@JsonProperty("Specimen_source_site_code")
	public String getSpecimenSourceSiteCode() {
		return "Nasal";
	}

	@JsonProperty("Specimen_type_code")
	public String getSpecimenTypeCode() {
		return "697989009"; // Anterior nares swab
	}

	@JsonProperty("Instrument_ID")
	public String getInstrumentID() {
		return testEvent.getDeviceType().getInternalId().toString();
	}

	@JsonProperty("Test_date")
	public String getTestDate() {
		return dateToHealthCareString(convertToLocalDate(testEvent.getCreatedAt()));
	}

	@JsonProperty("Date_result_released")
	public String getDateResultReleased() {
		return dateToHealthCareString(LocalDate.now());
	}
}
