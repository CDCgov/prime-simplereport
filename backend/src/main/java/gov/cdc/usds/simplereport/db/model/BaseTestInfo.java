package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import javax.persistence.Column;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;
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

  @Column(nullable = true)
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestResult result;

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

  public DeviceSpecimenType getDeviceSpecimen() {
    return deviceSpecimen;
  }

  public TestResult getResult() {
    return result;
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
