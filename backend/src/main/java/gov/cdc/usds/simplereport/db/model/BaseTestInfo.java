package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import java.util.List;
import javax.persistence.*;
import org.hibernate.annotations.Type;

@MappedSuperclass
public abstract class BaseTestInfo extends AuditedEntity implements OrganizationScoped {

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_id", updatable = false)
  private Person patient;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "organization_id", updatable = false)
  private Organization organization;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "facility_id", updatable = false)
  private Facility facility;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "device_specimen_type_id")
  private DeviceSpecimenType deviceSpecimen;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "device_type_id")
  private DeviceType deviceType;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "specimen_type_id")
  private SpecimenType specimenType;

  @Column(nullable = true)
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestResult result;

  // it doesn't like this: SQLGrammarException could not extract ResultSet
  @OneToMany(mappedBy = "result", fetch = FetchType.LAZY)
  private List<Result> results;
  //  private Set<Result> results;

  @Column private Date dateTestedBackdate;

  @Column
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestCorrectionStatus correctionStatus;

  @Column(nullable = true)
  private String reasonForCorrection;

  protected BaseTestInfo() {
    super();
  }

  protected BaseTestInfo(BaseTestInfo orig) {
    this(orig.getPatient(), orig.getFacility(), orig.getDeviceSpecimen(), orig.getResult());
  }

  protected BaseTestInfo(
      Person patient, Facility facility, DeviceSpecimenType deviceSpecimen, TestResult result) {
    super();
    this.patient = patient;
    this.facility = facility;
    this.organization = facility.getOrganization();
    this.deviceSpecimen = deviceSpecimen;
    this.deviceType = deviceSpecimen.getDeviceType();
    this.specimenType = deviceSpecimen.getSpecimenType();
    this.result = result;
    this.correctionStatus = TestCorrectionStatus.ORIGINAL;
  }

  protected BaseTestInfo(Person patient, Facility facility) {
    this(patient, facility, facility.getDefaultDeviceSpecimen(), null);
  }

  protected BaseTestInfo(
      BaseTestInfo cloneInfo, TestCorrectionStatus correctionStatus, String reasonForCorrection) {
    this(cloneInfo);
    this.reasonForCorrection = reasonForCorrection;
    this.correctionStatus = correctionStatus;
  }

  public Person getPatient() {
    return patient;
  }

  @Override
  public Organization getOrganization() {
    return organization;
  }

  public Facility getFacility() {
    return facility;
  }

  public DeviceType getDeviceType() {
    return deviceType;
  }

  public SpecimenType getSpecimenType() {
    return specimenType;
  }

  public DeviceSpecimenType getDeviceSpecimen() {
    return deviceSpecimen;
  }

  public TestResult getResult() {
    System.out.println(results);
    return result;
    //    Optional<Result> resultObject = this.results.stream().findFirst();
    //        // Backwards-compatibility: if result table isn't populated, fetch old result column
    //    if (resultObject.isEmpty()) {
    //      return result;
    //    } else {
    //      return Translators.convertLoincToResult(resultObject.get().getResult());
    //    }
  }

  // FYI Setters shouldn't be allowed in TestEvent, so they are always *protected*
  // in this base class
  // and exposed only in TestOrder.

  public Date getDateTestedBackdate() {
    return dateTestedBackdate;
  }

  protected void setDateTestedBackdate(Date dateTestedBackdate) {
    this.dateTestedBackdate = dateTestedBackdate;
  }

  protected void setTestResult(TestResult newResult) {
    result = newResult;
  }

  protected void setDeviceSpecimen(DeviceSpecimenType deviceSpecimen) {
    this.deviceSpecimen = deviceSpecimen;
    this.deviceType = deviceSpecimen.getDeviceType();
    this.specimenType = deviceSpecimen.getSpecimenType();
  }

  public TestCorrectionStatus getCorrectionStatus() {
    return correctionStatus;
  }

  protected void setCorrectionStatus(TestCorrectionStatus correctionStatus) {
    this.correctionStatus = correctionStatus;
  }

  public String getReasonForCorrection() {
    return reasonForCorrection;
  }

  protected void setReasonForCorrection(String reasonForCorrection) {
    this.reasonForCorrection = reasonForCorrection;
  }
}

// let's think out loud in the comments for a moment.
// This base class supports both TestEvent and TestOrder.
// TestOrder has getters/setters for both, while TestEvent only has getters.
// To support multiple diseases, we'll need to pass in both the disease type and the result when
// creating results.
// Maybe an "addResult" instead of "setResult"?
// It could also help to have some kind of result object that looks at the available diseases and
// allows you to set
// results for each.
// That object gets passed in to TestEvent/TestOrder and we unwrap and store in the database
// appropriately.
// We will likely also need getters/setters that fetch results for a specific disease, as well as a
// default
// that fetches covid. ( testOrder.getResultForDisease(SupportedDisease disease);
// testOrder.getResult() )

// most recent exceptions in postgres: ERROR:  operator does not exist: text = uuid
// this would seem to indicate that I'm trying to pass in text when I should be passing UUID (or
// vice versa)
// this is likely why I'm getting the SQLGrammarException
