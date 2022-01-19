package gov.cdc.usds.simplereport.api.model.pxp;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
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
  private Person person;
  private OrderStatus orderStatus;
  private PxpTestEventWrapper testEventWrapper;

  public PxpVerifyResponse(Person person, OrderStatus orderStatus, TestEvent testEvent) {
    this.person = person;
    this.orderStatus = orderStatus;
    this.testEventWrapper = testEvent != null ? new PxpTestEventWrapper(testEvent) : null;
  }

  public String getLookupId() {
    return person.getLookupId();
  }

  public String getFirstName() {
    return person.getFirstName();
  }

  public String getMiddleName() {
    return person.getMiddleName();
  }

  public String getLastName() {
    return person.getLastName();
  }

  public String getSuffix() {
    return person.getSuffix();
  }

  public LocalDate getBirthDate() {
    return person.getBirthDate();
  }

  public String getPreferredLanguage() {
    return person.getPreferredLanguage();
  }

  public TestResultDeliveryPreference getTestResultDelivery() {
    return person.getTestResultDelivery();
  }

  public String getTelephone() {
    return person.getTelephone();
  }

  public List<PhoneNumber> getPhoneNumbers() {
    return person.getPhoneNumbers();
  }

  public String getEmail() {
    return person.getEmail();
  }

  public String getRace() {
    return person.getRace();
  }

  public String getEthnicity() {
    return person.getEthnicity();
  }

  public List<String> getTribalAffiliation() {
    return person.getTribalAffiliation();
  }

  public String getGender() {
    return person.getGender();
  }

  public Boolean getResidentCongregateSetting() {
    return person.getResidentCongregateSetting();
  }

  public Boolean getEmployedInHealthcare() {
    return person.getEmployedInHealthcare();
  }

  public String getStreet() {
    return person.getStreet();
  }

  public String getStreetTwo() {
    return person.getState();
  }

  public String getCity() {
    return person.getCity();
  }

  public String getState() {
    return person.getState();
  }

  public String getZipCode() {
    return person.getZipCode();
  }

  public String getCounty() {
    return person.getCounty();
  }

  public PersonRole getRole() {
    return person.getRole();
  }

  public PxpTestEventWrapper getLastTest() {
    return testEventWrapper;
  }

  public String getOrganizationName() {
    if (person.getOrganization() == null) {
      return null;
    }
    return person.getOrganization().getOrganizationName();
  }

  public OrderStatus getOrderStatus() {
    return orderStatus;
  }
}

class PxpTestEventWrapper {
  TestEvent testEvent;

  public PxpTestEventWrapper(TestEvent testEvent) {
    this.testEvent = testEvent;
  }

  public Date getDateTested() {
    return testEvent.getDateTested();
  }

  public TestResult getResult() {
    return testEvent.getResult();
  }

  public String getDeviceTypeModel() {
    return testEvent.getTestOrder().getDeviceSpecimen().getDeviceType().getModel();
  }

  public String getDeviceTypeName() {
    return testEvent.getTestOrder().getDeviceSpecimen().getDeviceType().getName();
  }
}
