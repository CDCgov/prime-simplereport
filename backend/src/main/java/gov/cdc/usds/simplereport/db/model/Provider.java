package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import org.springframework.boot.context.properties.ConstructorBinding;

@Entity
public class Provider extends EternalAuditedEntity implements PersonEntity, LocatedEntity {

  @Embedded @JsonUnwrapped private PersonName nameInfo;

  @Column(nullable = false)
  private String providerId;

  @Embedded private StreetAddress address;
  @Column private String telephone;

  protected Provider() {
    /* for hibernate */
  }

  @ConstructorBinding
  public Provider(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String providerId,
      StreetAddress address,
      String telephone) {
    this(new PersonName(firstName, middleName, lastName, suffix), providerId, address, telephone);
  }

  public Provider(
      PersonName providerName,
      String providerId,
      StreetAddress providerAddress,
      String providerTelephone) {
    this.nameInfo = providerName;
    this.providerId = providerId;
    this.address = providerAddress;
    this.telephone = providerTelephone;
  }

  public PersonName getNameInfo() {
    return nameInfo;
  }

  public String getProviderId() {
    return providerId;
  }

  public void setProviderId(String providerId) {
    this.providerId = providerId;
  }

  public StreetAddress getAddress() {
    return address;
  }

  public void setAddress(StreetAddress address) {
    this.address = address;
  }

  @JsonIgnore
  public String getStreet() {
    return address == null ? "" : address.getStreetOne();
  }

  @JsonIgnore
  public String getStreetTwo() {
    return address == null ? "" : address.getStreetTwo();
  }

  @JsonIgnore
  public String getCity() {
    if (address == null) {
      return "";
    }
    return address.getCity();
  }

  @JsonIgnore
  public String getState() {
    if (address == null) {
      return "";
    }
    return address.getState();
  }

  @JsonIgnore
  public String getZipCode() {
    if (address == null) {
      return "";
    }
    return address.getPostalCode();
  }

  @JsonIgnore
  public String getCounty() {
    if (address == null) {
      return "";
    }
    return address.getCounty();
  }

  public String getTelephone() {
    return telephone;
  }

  public void setTelephone(String telephone) {
    this.telephone = telephone;
  }
}
