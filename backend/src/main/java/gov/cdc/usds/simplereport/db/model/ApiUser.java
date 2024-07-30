package gov.cdc.usds.simplereport.db.model;

import static jakarta.persistence.CascadeType.ALL;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
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
  @Getter
  @Setter
  private String loginEmail;

  @Setter @Embedded private PersonName nameInfo;

  @Column(nullable = true)
  @Getter
  private Date lastSeen;

  @OneToMany(cascade = ALL, mappedBy = "apiUser", orphanRemoval = true)
  private Set<ApiUserFacility> facilityAssignments = new HashSet<>();

  @OneToMany(cascade = ALL, mappedBy = "apiUser", orphanRemoval = true)
  private Set<ApiUserRole> roleAssignments = new HashSet<>();

  protected ApiUser() {
    /* for hibernate */ }

  public ApiUser(String email, PersonName name) {
    loginEmail = email;
    nameInfo = name;
    lastSeen = null;
  }

  @Override
  public PersonName getNameInfo() {
    return nameInfo;
  }

  public void updateLastSeen() {
    lastSeen = new Date();
  }

  public Set<Facility> getFacilities() {
    return this.facilityAssignments.stream()
        .map(ApiUserFacility::getFacility)
        .collect(Collectors.toSet());
  }

  public void setFacilities(Set<Facility> facilities) {
    this.facilityAssignments.clear();
    for (Facility facility : facilities) {
      this.facilityAssignments.add(new ApiUserFacility(this, facility));
    }
  }

  public void setRoles(Set<OrganizationRole> newOrgRoles, Organization org) {
    this.roleAssignments.clear();
    for (OrganizationRole orgRole : newOrgRoles) {
      if (orgRole.equals(OrganizationRole.NO_ACCESS)) {
        // the NO_ACCESS role is only relevant for the Okta implementation of authorization, and it
        // doesn't need to be persisted in our tables
        continue;
      }
      this.roleAssignments.add(new ApiUserRole(this, org, orgRole));
    }
  }
}
