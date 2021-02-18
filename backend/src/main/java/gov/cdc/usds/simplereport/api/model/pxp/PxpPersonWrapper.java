package gov.cdc.usds.simplereport.api.model.pxp;

import java.time.LocalDate;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;

/**
 * This Person POJO wrapper exists solely for serialization for the Patient
 * Experience endpoints. You'd think we could just use Person, because that
 * serializes just fine on its own – unfortunately the JsonIgnores include stuff
 * we need, which somehow get serialized in the GraphQL endpoints
 */
public class PxpPersonWrapper {
  private Person p;

  public PxpPersonWrapper(Person p) {
    this.p = p;
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
}
