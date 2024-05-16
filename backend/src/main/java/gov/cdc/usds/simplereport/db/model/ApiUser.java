package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import java.util.Date;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.NaturalId;

/** An authenticated identity that may or may not be linked to authorization data. */
@Entity
@DynamicUpdate
public class ApiUser extends EternalSystemManagedEntity implements PersonEntity {

  @Column(nullable = false, updatable = true, unique = true)
  @NaturalId(mutable = true)
  private String loginEmail;

  @Embedded private PersonName nameInfo;

  @Column(nullable = true)
  private Date lastSeen;

  @ManyToMany
  @JoinTable(
      name = "api_user_facility",
      joinColumns = @JoinColumn(name = "api_user_id"),
      inverseJoinColumns = @JoinColumn(name = "facility_id"))
  @Getter
  @Setter
  private Set<Facility> facilities;

  protected ApiUser() {
    /* for hibernate */ }

  public ApiUser(String email, PersonName name) {
    loginEmail = email;
    nameInfo = name;
    lastSeen = null;
  }

  public String getLoginEmail() {
    return loginEmail;
  }

  public void setLoginEmail(String newEmail) {
    loginEmail = newEmail;
  }

  public Date getLastSeen() {
    return lastSeen;
  }

  public void updateLastSeen() {
    lastSeen = new Date();
  }

  public PersonName getNameInfo() {
    return nameInfo;
  }

  public void setNameInfo(PersonName name) {
    nameInfo = name;
  }
}
