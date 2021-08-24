package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.MapsId;
import javax.persistence.OneToOne;
import org.hibernate.annotations.Type;

@Entity
public class PatientPreferences extends AuditedEntity {
  public static final PatientPreferences DEFAULT = new PatientPreferences();

  @MapsId
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "internal_id")
  private Person person;

  @Column private String preferredLanguage;

  @Column
  @Type(type = "pg_enum")
  @Enumerated(EnumType.STRING)
  private TestResultDeliveryPreference testResultDelivery;

  protected PatientPreferences() {
    /* for hibernate */
  }

  public PatientPreferences(Person person) {
    this(person, null, TestResultDeliveryPreference.NONE);
  }

  public PatientPreferences(
      Person person, String preferredLanguage, TestResultDeliveryPreference testResultDelivery) {
    this.person = person;
    this.preferredLanguage = preferredLanguage;
    this.testResultDelivery = testResultDelivery;
  }

  public String getPreferredLanguage() {
    return preferredLanguage;
  }

  public TestResultDeliveryPreference getTestResultDelivery() {
    return testResultDelivery;
  }

  public void setPreferredLanguage(String preferredLanguage) {
    this.preferredLanguage = preferredLanguage;
  }

  public void setTestResultDelivery(TestResultDeliveryPreference testResultDelivery) {
    this.testResultDelivery = testResultDelivery;
  }
}
