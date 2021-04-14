package gov.cdc.usds.simplereport.api.model.pxp;

import gov.cdc.usds.simplereport.db.model.PatientPreferences;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

/**
 * This Person POJO wrapper exists solely for serialization for the Patient Experience endpoints.
 * You'd think we could just use Person, because that serializes just fine on its own
 * – unfortunately the JsonIgnores include stuff we need, which somehow get serialized in the
 * GraphQL endpoints
 */
public class PxpVerifyResponse {
  private Person p;
  private OrderStatus os;
  private PxpTestEventWrapper te;
  private PatientPreferences patientPreferences;

  public PxpVerifyResponse(Person p, OrderStatus os, TestEvent te, PatientPreferences pp) {
    this.p = p;
    this.os = os;
    this.te = te != null ? new PxpTestEventWrapper(te) : null;
    this.patientPreferences = pp;
  }

  public String getLookupId() {
    return p.getLookupId();
  }

  public String getFirstName() {
    return p.getFirstName();
  }

  public String getMiddleName() {
    return p.getMiddleName();
  }

  public String getLastName() {
    return p.getLastName();
  }

  public String getSuffix() {
    return p.getSuffix();
  }

  public LocalDate getBirthDate() {
    return p.getBirthDate();
  }

  public String getPreferredLanguage() {
    return patientPreferences.getPreferredLanguage();
  }

  public TestResultDeliveryPreference getTestResultDelivery() {
    return patientPreferences.getTestResultDelivery();
  }

  public String getTelephone() {
    return p.getTelephone();
  }

  public String getEmail() {
    return p.getEmail();
  }

  public String getRace() {
    return p.getRace();
  }

  public String getEthnicity() {
    return p.getEthnicity();
  }

  public List<String> getTribalAffiliation() {
    return p.getTribalAffiliation();
  }

  public String getGender() {
    return p.getGender();
  }

  public Boolean getResidentCongregateSetting() {
    return p.getResidentCongregateSetting();
  }

  public Boolean getEmployedInHealthcare() {
    return p.getEmployedInHealthcare();
  }

  public String getStreet() {
    return p.getStreet();
  }

  public String getStreetTwo() {
    return p.getState();
  }

  public String getCity() {
    return p.getCity();
  }

  public String getState() {
    return p.getState();
  }

  public String getZipCode() {
    return p.getZipCode();
  }

  public String getCounty() {
    return p.getCounty();
  }

  public PersonRole getRole() {
    return p.getRole();
  }

  public PxpTestEventWrapper getLastTest() {
    return te;
  }

  public String getOrganizationName() {
    if (p.getOrganization() == null) {
      return null;
    }
    return p.getOrganization().getOrganizationName();
  }

  public OrderStatus getOrderStatus() {
    return os;
  }
}

class PxpTestEventWrapper {
  TestEvent te;

  public PxpTestEventWrapper(TestEvent te) {
    this.te = te;
  }

  public Date getDateTested() {
    return te.getDateTested();
  }

  public TestResult getResult() {
    return te.getResult();
  }

  public String getDeviceTypeModel() {
    return te.getTestOrder().getDeviceSpecimen().getDeviceType().getModel();
  }
}
