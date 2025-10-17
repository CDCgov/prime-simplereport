package gov.cdc.usds.simplereport.db.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.util.Objects;
import java.util.UUID;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
public class PhoneNumber extends AuditedEntity {
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "person_internal_id")
  private Person person;

  @Enumerated(EnumType.STRING)
  @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(columnDefinition = "PHONE_TYPES")
  private PhoneType type;

  @Column private String number;

  @Column @Getter private Boolean piiDeleted;

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
