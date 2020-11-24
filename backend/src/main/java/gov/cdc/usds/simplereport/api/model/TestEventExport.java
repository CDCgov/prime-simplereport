package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Organization;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Date;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

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
	private Map<String, String> genderMap = new HashMap<String, String>() {{
		put("male", "M");
		put("female", "F");
		put("other", "O");
		put(null, "UNK");
	}};

	private Map<String, String> ethnicityMap = new HashMap<String, String>() {{
		put("hispanic", "H");
		put("not_hispanic", "N");
		put(null, "U");
	}};

	private Map<TestResult, String> testResultMap = new HashMap<TestResult, String>() {{
		put(TestResult.POSITIVE, "260373001");
		put(TestResult.NEGATIVE, "260415000");
		put(TestResult.UNDETERMINED, "419984006");
	}};


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
		return genderMap.get(patient.getGender());
	}

	@JsonProperty("Patient_ethnicity")
	public String getPatientEthnicity() {
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

	@JsonProperty("Patient_lookupId")
	public String getPatientLookupId() {
		return patient.getLookupId();
	}

	@JsonProperty("Patient_Id")
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

	@JsonProperty("Testing_lab_ID")
	public String getTestingLabID() {
		// CLIA number
		return org.getExternalId();
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
		return provider.getLastName();
	}

	@JsonProperty("Ordering_provider_first_name")
	public String getOrderingProviderFirstName() {
		return provider.getFirstName();
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
		// 	- name: covid-19/order
		// system: LOINC
		// reference: Incomplete - Supports BD Veritor, Quidell Sofia, and Abbott ID Now
		// referenceUrl: https://www.cdc.gov/csels/dls/documents/livd_test_code_mapping/LIVD-SARS-CoV-2-2020-10-21.xlsx
		// values:
		//   - code: 94563-4
		//     display: SARS coronavirus 2 IgG Ab [Presence] in Serum or Plasma by Immunoassay
		//   - code: 94500-6
		//     display: SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection
		//   - code: 94558-4
		//     display: SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay
		//   - code: 94534-5
		//     display: SARS coronavirus 2 RdRp gene [Presence] in Respiratory specimen by NAA with probe detection
		//   - code: 94564-2
		//     display: SARS-CoV-2 (COVID-19) IgM Ab [Presence] in Serum or Plasma by Immunoassay
		//   - code: 94531-1
		//     display: SARS coronavirus 2 RNA panel - Respiratory specimen by NAA with probe detection
		//   - code: 94559-2
		//     display: SARS coronavirus 2 ORF1ab region [Presence] in Respiratory specimen by NAA with probe detection
		//   - code: 95209-3
		//     display: SARS coronavirus+SARS coronavirus 2 Ag [Presence] in Respiratory specimen by Rapid immunoassay
		return ""; // TODO: what is this
	}

	@JsonProperty("Specimen_source_site_code")
	public String getSpecimenSourceSiteCode() {
		return "Forearm";
	}

	@JsonProperty("Specimen_type_code")
	public String getSpecimenTypeCode() {
		// values:
    // - code: 258500001
    //   display: Nasopharyngeal swab
    // - code: 871810001
    //   display: Mid-turbinate nasal swab
    // - code: 697989009
    //   display: Anterior nares swab
    // - code: 258411007
    //   display: Nasopharyngeal aspirate
    // - code: 429931000124105
    //   display: Nasal aspirate
    // - code: 258529004
    //   display: Throat swab
    // - code: 119334006
    //   display: Sputum specimen
    // - code: 119342007
    //   display: Saliva specimen
    // - code: 258607008
    //   display: Bronchoalveolar lavage fluid sample
    // - code: 119364003
    //   display: Serum specimen
    // - code: 119361006
    //   display: Plasma specimen
    // - code: 440500007
    //   display: Dried blood spot specimen
    // - code: 258580003
    //   display: Whole blood sample
    // - code: 122555007
    //   display: Venous blood specimen
		return ""; // "871810001", "697989009", or "258500001"
	}

	@JsonProperty("Instrument_ID")
	public String getInstrumentID() {
		return testEvent.getDeviceType().getInternalId().toString(); // TODO: seems that we are missing the INOIC(?) code
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
