package gov.cdc.usds.simplereport.db.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
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

  @OneToMany(cascade = CascadeType.ALL, mappedBy = "apiUser", orphanRemoval = true)
  private Set<ApiUserFacility> facilityAssignments = new HashSet<>();

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

  public Set<Facility> getFacilities() {
    return this.facilityAssignments.stream()
        .map(ApiUserFacility::getFacility)
        .collect(Collectors.toSet());
  }

  public void setFacilities(Set<Facility> facilities) {
    this.facilityAssignments.clear();
    for (Facility f : facilities) {
      ApiUserFacility auf = new ApiUserFacility();
      auf.setApiUser(this);
      auf.setFacility(f);
      this.facilityAssignments.add(auf);
    }
  }
}
