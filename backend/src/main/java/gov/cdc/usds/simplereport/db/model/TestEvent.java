package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import java.util.UUID;
import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import lombok.Getter;
import org.hibernate.Hibernate;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Getter
@Entity
@Immutable
@AttributeOverride(name = "result", column = @Column(nullable = false))
public class TestEvent extends BaseTestInfo {
  private static final Logger LOG = LoggerFactory.getLogger(TestEvent.class);

  @Column
  @Type(type = "jsonb")
  private Person patientData;

  @Column
  @Type(type = "jsonb")
  private Provider providerData;

  @Column
  @Type(type = "jsonb")
  private AskOnEntrySurvey surveyData;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "test_order_id")
  private TestOrder order;

  @Column(columnDefinition = "uuid")
  private UUID priorCorrectedTestEventId; // used to chain events

  private Boolean patientHasPriorTests;

  public TestEvent() {}

  public TestEvent(
      TestResult result,
      DeviceSpecimenType deviceType,
      Person patient,
      Facility facility,
      TestOrder testOrder) {
    this(result, deviceType, patient, facility, testOrder, false);
  }

  public TestEvent(
      TestResult result,
      DeviceSpecimenType deviceType,
      Person patient,
      Facility facility,
      TestOrder order,
      Boolean hasPriorTests) {
    super(patient, facility, deviceType, result);
    // store a link, and *also* store the object as JSON
    // force load the lazy-loaded phone numbers so values are available to the object mapper
    // when serializing `patientData` (phoneNumbers is default lazy-loaded because of `OneToMany`)
    Hibernate.initialize(patient.getPrimaryPhone());
    Hibernate.initialize(patient.getTelephone());
    Hibernate.initialize(patient.getPhoneNumbers());

    this.patientData = patient;
    this.providerData = getFacility().getOrderingProvider();
    this.order = order;
    this.patientHasPriorTests = hasPriorTests;
    setDateTestedBackdate(order.getDateTestedBackdate());
    PatientAnswers answers = order.getAskOnEntrySurvey();
    if (answers != null) {
      this.surveyData = order.getAskOnEntrySurvey().getSurvey();
    } else {
      // this can happen during unit tests, but never in prod.
      LOG.error("Order {} missing PatientAnswers", order.getInternalId());
    }
  }

  public TestEvent(TestOrder testOrder) {
    this(testOrder, false);
  }

  public TestEvent(TestOrder testOrder, Boolean hasPriorTests) {
    this(
        testOrder.getResult(),
        testOrder.getDeviceSpecimen(),
        testOrder.getPatient(),
        testOrder.getFacility(),
        testOrder,
        hasPriorTests);
  }

  // Constructor for creating corrections. Copy the original event
  public TestEvent(
      TestEvent event, TestCorrectionStatus correctionStatus, String reasonForCorrection) {
    super(event, correctionStatus, reasonForCorrection);

    this.patientData = event.getPatientData();
    this.providerData = event.getProviderData();
    this.order = event.getTestOrder();
    this.surveyData = event.getSurveyData();
    setDateTestedBackdate(order.getDateTestedBackdate());
    this.priorCorrectedTestEventId = event.getInternalId();
  }

  public UUID getPatientInternalID() {
    return getPatient().getInternalId();
  }

  public Person getPatientData() {
    return patientData;
  }

  public AskOnEntrySurvey getSurveyData() {
    return surveyData;
  }

  public Date getDateTested() {
    if (getDateTestedBackdate() != null) {
      return getDateTestedBackdate();
    } else {
      return getCreatedAt();
    }
  }

  public Provider getProviderData() {
    return providerData;
  }

  public TestOrder getTestOrder() {
    return order;
  }

  public UUID getTestOrderId() {
    return order.getInternalId();
  }

  public UUID getPriorCorrectedTestEventId() {
    return priorCorrectedTestEventId;
  }
}
