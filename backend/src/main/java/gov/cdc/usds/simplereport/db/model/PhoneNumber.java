package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import org.hibernate.annotations.Type;

@Entity
public class PhoneNumber extends AuditedEntity {
  @ManyToOne(optional = false)
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

  public Person getPerson() {
    return person;
  }

  public PhoneType getType() {
    return type;
  }

  public String getNumber() {
    return number;
  }

  public boolean isMobile() {
    return type == PhoneType.MOBILE;
  }

  public boolean isLandline() {
    return type == PhoneType.LANDLINE;
  }
}
