package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.DiseaseResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.persistence.*;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Hibernate;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Type;

@Getter
@Entity
@Immutable
@AttributeOverride(name = "result", column = @Column(nullable = false))
@Slf4j
public class TestEvent extends BaseTestInfo {
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

  @OneToMany(mappedBy = "testEvent", fetch = FetchType.LAZY)
  private Set<Result> results;

  @Column(columnDefinition = "uuid")
  private UUID priorCorrectedTestEventId; // used to chain events

  private Boolean patientHasPriorTests;

  public TestEvent() {}

  // need to create a new constructor that takes a list of DiseaseResults
  // otherwise, assume the current constructors are submitting covid results
  public TestEvent(
      TestResult result,
      DeviceSpecimenType deviceType,
      Person patient,
      Facility facility,
      TestOrder testOrder) {
    this(result, deviceType, patient, facility, testOrder, false);
  }

  public TestEvent(
      DiseaseResult diseaseResult,
      DeviceSpecimenType deviceType,
      Person patient,
      Facility facility,
      TestOrder order,
      Boolean hasPriorTests) {
    super(patient, facility, deviceType);
    // need to use the addResult logic here!!
    // We need to read the test order and see if there's already a result there
    // if not, create new results
    // also need to update other constructors to take a DiseaseResult instead of a regular result

    if (order.getResultSet().isEmpty()) {
      // need to create a new Result object
      // we'll need to update this to accept multiple result objects
      // but that can happen in the next PR
      Result result = new Result(order, this, diseaseResult);
      this.results.add(new Result(order, this, diseaseResult));
      order.addResult(result);
    } else {
      // need to update the existing results objects to include the test event id
      // it really feels like there should be a JPA way to do this...but I don't know what that is
      order.getResultSet().forEach(r -> r.setTestEvent(this));
    }

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
      log.error("Order {} missing PatientAnswers", order.getInternalId());
    }
  }

  public TestEvent(TestOrder testOrder) {
    this(testOrder, false);
  }

  public TestEvent(TestOrder testOrder, Boolean hasPriorTests) {
    this(
        testOrder.getResult(),
        // get the results set off the test order instead
        //        testOrder.getRes
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

  public DeviceSpecimenType getDeviceSpecimenType() {
    return order.getDeviceSpecimen();
  }

  public TestResult getTestResult() {
    Optional<Result> resultObject = this.results.stream().findFirst();
    // Backwards-compatibility: if result table isn't populated, fetch old result column
    if (resultObject.isEmpty()) {
      return order.getResult();
    } else {
      return Translators.convertLoincToResult(resultObject.get().getResultLOINC());
    }
  }
}

// What we need:
// X create a helper db model class that pairs a disease with a result
// - update getters/setters on TestOrder to use the new result model
// - update getters on TestEvent to use the new result model
// - update constructor on TestEvent and TestOrder to use the new result model
// - add a result column to SupportedDisease entity
// - update repositories? will need to do this in tandem with updating the setters/constructors

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
