package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.Objects;
import java.util.UUID;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.Type;

@Entity
public class PhoneNumber extends AuditedEntity {
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "person_internal_id")
  private Person person;

  @Enumerated(EnumType.STRING)
  @Type(type = "pg_enum")
  @Column
  private PhoneType type;

  @Column private String number;

  public PhoneNumber() {
    /* For Hibernate */
  }

  public PhoneNumber(PhoneType type, String number) {
    this.type = type;
    this.number = number;
  }

  public PhoneNumber(Person person, PhoneType type, String number) {
    this(type, number);
    this.person = person;
  }

  public void setPerson(Person person) {
    this.person = person;
  }

  public void setType(PhoneType type) {
    this.type = type;
  }

  @JsonIgnore
  public UUID getPersonInternalID() {
    return person.getInternalId();
  }

  public PhoneType getType() {
    return type;
  }

  public String getNumber() {
    return number;
  }

  @JsonIgnore
  public boolean isMobile() {
    return type == PhoneType.MOBILE;
  }

  @JsonIgnore
  public boolean isLandline() {
    return type == PhoneType.LANDLINE;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    PhoneNumber that = (PhoneNumber) o;
    if (!Objects.equals(type, that.type)) {
      return false;
    }
    try {
      var phoneUtil = PhoneNumberUtil.getInstance();
      var a =
          phoneUtil.format(
              phoneUtil.parse(this.number, "US"), PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
      var b =
          phoneUtil.format(
              phoneUtil.parse(that.number, "US"), PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
      return a.equals(b);
    } catch (NumberParseException e) {
      // this shouldn't happen, but I don't want an upsert to fail because an old phone number,
      // saved prior to front-end validation, is invalid and couldn't be parsed
      return false;
    }
  }

  @Override
  public int hashCode() {
    return Objects.hash(person, number, type);
  }
}
