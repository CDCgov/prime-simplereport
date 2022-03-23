package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.persistence.AttributeOverride;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
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

  // Convenience constructor, only used in tests
  public TestEvent(TestOrder testOrder) {
    this(testOrder, false);
  }

  public TestEvent(TestOrder order, Boolean hasPriorTests) {
    super(order.getPatient(), order.getFacility(), order.getDeviceSpecimen());

    if (order.getResultSet().isEmpty()) {
      throw new IllegalArgumentException("TestOrder must contain a result");
    }

    order.getResultSet().forEach(result -> result.setTestEvent(this));

    // store a link, and *also* store the object as JSON
    // force load the lazy-loaded phone numbers so values are available to the object mapper
    // when serializing `patientData` (phoneNumbers is default lazy-loaded because of `OneToMany`)
    Hibernate.initialize(getPatient().getPrimaryPhone());
    Hibernate.initialize(getPatient().getTelephone());
    Hibernate.initialize(getPatient().getPhoneNumbers());

    this.patientData = getPatient();
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
    // need to somehow deal with results here, I think
    // unless results are supposed to be void for corrected testEvents
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

  // This logic (specifically, the findFirst) will need to be updated later on in the multiplex
  // process - this method is
  // temporary
  // Eventually, this method will be deprecated in favor of getResultSet()
  public TestResult getTestResult() {
    Optional<Result> resultObject = this.results.stream().findFirst();
    // Backwards-compatibility: if result table isn't populated, fetch old result column
    if (resultObject.isEmpty()) {
      return super.getResult();
    } else {
      return Translators.convertLoincToResult(resultObject.get().getResultLOINC());
    }
  }

  @Override
  public TestResult getResult() {
    return getTestResult();
  }

  public Set<Result> getResults() {
    return this.results;
  }
}
