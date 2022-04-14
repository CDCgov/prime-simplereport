package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.util.Date;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import org.hibernate.annotations.Type;

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

  protected TestOrder() {
    /* for hibernate */ }

  public TestOrder(Person patient, Facility facility) {
    super(patient, facility);
    this.orderStatus = OrderStatus.PENDING;
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

  public TestResult getTestResult() {
    return getResult();
  }

  public void setResult(TestResult finalResult) {
    super.setTestResult(finalResult);
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
}
