package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.util.Objects;
import javax.persistence.Column;
import javax.persistence.Embeddable;

@Embeddable
public class PersonName {

  @Column private String firstName;
  @Column private String middleName;

  @Column(nullable = false)
  private String lastName;

  @Column private String suffix;

  public PersonName() {
    /* sigh */
  }

  public PersonName(String firstName, String middleName, String lastName, String suffix) {
    this.firstName = firstName;
    this.middleName = middleName;
    this.lastName = lastName;
    this.suffix = suffix;
  }

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String firstName) {
    this.firstName = firstName;
  }

  public String getMiddleName() {
    return middleName;
  }

  public void setMiddleName(String middleName) {
    this.middleName = middleName;
  }

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String lastName) {
    this.lastName = lastName;
  }

  public String getSuffix() {
    return suffix;
  }

  public void setSuffix(String suffix) {
    this.suffix = suffix;
  }

  @Override
  public boolean equals(Object obj) {
    if (obj instanceof PersonName) {
      PersonName other = (PersonName) obj;
      return Objects.equals(firstName, other.firstName)
          && Objects.equals(lastName, other.lastName)
          && Objects.equals(middleName, other.middleName)
          && Objects.equals(suffix, other.suffix);
    }
    return super.equals(obj);
  }

  @Override
  public int hashCode() {
    return Objects.hash(firstName, middleName, lastName, suffix);
  }

  @Override
  public String toString() {
    StringBuilder b = new StringBuilder();
    if (firstName != null) {
      b.append(firstName);
    }
    if (middleName != null) {
      if (b.length() > 0) {
        b.append(' ');
      }
      b.append(middleName);
    }
    if (lastName != null) {
      if (b.length() > 0) {
        b.append(' ');
      }
      b.append(lastName);
    }
    if (suffix != null) {
      if (b.length() > 0) {
        b.append(", ");
      }
      b.append(suffix);
    }
    return b.toString();
  }
}
