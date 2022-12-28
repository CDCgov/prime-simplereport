package gov.cdc.usds.simplereport.db.model;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToServiceRequest;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Type;
import org.hl7.fhir.r4.model.ServiceRequest;

@Entity
public class TestOrder extends BaseTestInfo {

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "patient_answers_id")
  private PatientAnswers askOnEntrySurvey;

  /**
   * This field and its getter exist to ensure that Hibernate doesn't load each PatientAnswers for
   * the TestOrders as they're streamed in PatientAnswersDataLoader. Sometimes, apparently,
   * FetchType.LAZY isn't enough.
   */
  @Column(name = "patient_answers_id", insertable = false, updatable = false)
  private UUID patientAnswersId;

  @Column private LocalDate dateTested; // REMOVE THIS COLUMN

  @Column(nullable = false)
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private OrderStatus orderStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "test_event_id")
  private TestEvent testEvent;

  @JsonIgnore
  @OneToMany(mappedBy = "testOrder", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
  @Getter
  @Setter
  private Set<Result> results = new HashSet<>();

  protected TestOrder() {
    /* for hibernate */ }

  public TestOrder(Person patient, Facility facility) {
    super(patient, facility);
    this.orderStatus = OrderStatus.PENDING;
    this.results = new HashSet<>();
  }

  public OrderStatus getOrderStatus() {
    return orderStatus;
  }

  public void setAskOnEntrySurvey(PatientAnswers askOnEntrySurvey) {
    this.askOnEntrySurvey = askOnEntrySurvey;
  }

  public PatientAnswers getAskOnEntrySurvey() {
    return askOnEntrySurvey;
  }

  @Override
  public void setDeviceSpecimen(DeviceSpecimenType ds) {
    super.setDeviceSpecimen(ds);
  }

  @Override
  public void setDateTestedBackdate(Date date) {
    super.setDateTestedBackdate(date);
  }

  /**
   * A helper method to only return pending results - those associated with a TestOrder, but not yet
   * a TestEvent. This is used to display results while the test is in the queue.
   */
  @JsonIgnore
  public Set<Result> getPendingResultSet() {
    Set<Result> pendingResults;
    pendingResults =
        this.results.stream().filter(r -> r.getTestEvent() == null).collect(Collectors.toSet());
    // This is special logic for corrections.
    // If the pending results are empty but the frontend is asking for them, it's because a test was
    // reopened.
    // We want to show the original results when a correction first opens, so we check to see if
    // there's a testEvent associated and if so, show those results.
    // Otherwise, the test will reopen with empty results.
    if (pendingResults.isEmpty() && this.getTestEvent() != null) {
      TestEvent canonicalEvent = this.getTestEvent();
      pendingResults =
          this.results.stream()
              .filter(r -> r.getTestEvent().getInternalId().equals(canonicalEvent.getInternalId()))
              .collect(Collectors.toSet());
    }
    return pendingResults;
  }

  public Optional<Result> getResultForDisease(SupportedDisease disease) {
    if (results != null) {
      return results.stream().filter(r -> r.getDisease().equals(disease)).findFirst();
    }
    return Optional.empty();
  }

  public void markComplete() {
    orderStatus = OrderStatus.COMPLETED;
  }

  public void markPending() {
    orderStatus = OrderStatus.PENDING;
  }

  public void cancelOrder() {
    orderStatus = OrderStatus.CANCELED;
  }

  public void setTestEventRef(TestEvent testEvent) {
    this.testEvent = testEvent;
  }

  public TestEvent getTestEvent() {
    return testEvent;
  }

  public String getPregnancy() {
    return askOnEntrySurvey.getSurvey().getPregnancy();
  }

  public String getSymptoms() {
    return askOnEntrySurvey.getSurvey().getSymptomsJSON();
  }

  public LocalDate getSymptomOnset() {
    return askOnEntrySurvey.getSurvey().getSymptomOnsetDate();
  }

  public Boolean getNoSymptoms() {
    return askOnEntrySurvey.getSurvey().getNoSymptoms();
  }

  // this will eventually be used when corrections are put back into the queue to
  // be corrected
  @Override
  public void setCorrectionStatus(TestCorrectionStatus newCorrectionStatus) {
    super.setCorrectionStatus(newCorrectionStatus);
  }

  @Override
  public void setReasonForCorrection(String reasonForCorrection) {
    super.setReasonForCorrection(reasonForCorrection);
  }

  public UUID getPatientAnswersId() {
    return patientAnswersId;
  }

  public void addResult(Result result) {
    this.results.add(result);
  }

  public ServiceRequest toFhir() {
    return convertToServiceRequest(this);
  }
}
