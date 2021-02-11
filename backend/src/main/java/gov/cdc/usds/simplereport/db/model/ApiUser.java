package gov.cdc.usds.simplereport.db.model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;

import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.NaturalId;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/**
 * The bare minimum required to link an authenticated identity to actions and
 * data elsewhere in the schema.
 */
@Entity
@DynamicUpdate
public class ApiUser extends SystemManagedEntity {

    @Column(nullable = false, updatable = true, unique = true)
    @NaturalId(mutable = true)
    private String loginEmail;
    @Embedded
    private PersonName nameInfo;
    @Column(nullable = true)
    private Date lastSeen;

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
}
