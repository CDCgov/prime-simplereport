package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.service.AzureStorageQueueFhirReportingService.COVID_LOINC;
import static gov.cdc.usds.simplereport.service.DiseaseService.COVID19_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_A_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_B_NAME;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.persistence.AttributeOverride;
import javax.persistence.CascadeType;
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

  @JsonIgnore
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "test_order_id")
  private TestOrder order;

  @JsonIgnore
  @OneToMany(mappedBy = "testEvent", cascade = CascadeType.MERGE, fetch = FetchType.LAZY)
  private Set<Result> results = new HashSet<>();

  @Column(columnDefinition = "uuid")
  private UUID priorCorrectedTestEventId; // used to chain events

  private Boolean patientHasPriorTests;

  public TestEvent() {}

  // Convenience constructor, only used in tests
  public TestEvent(TestOrder testOrder) {
    this(testOrder, false);
  }

  public TestEvent(TestOrder order, Boolean hasPriorTests) {
    super(order.getPatient(), order.getFacility(), order.getDeviceType(), order.getSpecimenType());
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

  // Constructor for test removals
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

  // Constructor for test corrections
  public TestEvent(
      TestOrder order, TestCorrectionStatus correctionStatus, String reasonForCorrection) {
    super(order, correctionStatus, reasonForCorrection);

    TestEvent event = order.getTestEvent();

    this.patientData = event.getPatientData();
    this.providerData = event.getProviderData();
    this.order = order;
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

  @JsonIgnore
  public TestOrder getTestOrder() {
    return order;
  }

  public UUID getTestOrderId() {
    return order.getInternalId();
  }

  public UUID getPriorCorrectedTestEventId() {
    return priorCorrectedTestEventId;
  }

  public Optional<TestResult> getCovidTestResult() {
    Optional<Result> resultObject =
        this.results.stream()
            .filter(result -> COVID_LOINC.equals(result.getDisease().getLoinc()))
            .findFirst();
    return resultObject.map(Result::getTestResult);
  }

  public boolean hasCovidResult() {
    return this.results.stream()
        .anyMatch(result -> COVID19_NAME.equals(result.getDisease().getName()));
  }

  public boolean hasFluResult() {
    return this.results.stream()
        .anyMatch(
            result ->
                FLU_A_NAME.equals(result.getDisease().getName())
                    || FLU_B_NAME.equals(result.getDisease().getName()));
  }
}
