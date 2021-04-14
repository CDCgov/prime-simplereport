package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class PhoneNumber extends AuditedEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "person_internal_id")
  private Person person;

  @Enumerated(EnumType.STRING)
  @Column
  private PhoneType type;

  @Column private String number;

  public Person getPerson() {
    return person;
  }

  public PhoneType getType() {
    return type;
  }

  public String getNumber() {
    return number;
  }

  public void setNumber(String number) {
    this.number = number;
  }

  public boolean isMobile() {
    return type == PhoneType.MOBILE;
  }

  public boolean isLandline() {
    return type == PhoneType.LANDLINE;
  }
}
