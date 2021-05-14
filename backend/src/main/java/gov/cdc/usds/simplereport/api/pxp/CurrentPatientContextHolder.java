package gov.cdc.usds.simplereport.api.pxp;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class CurrentPatientContextHolder {

  private TestOrder _currentLinkedOrder;
  private PatientLink _currentPatientLink;
  private Person _currentPatient;
  private Organization _organization;
  private boolean isPatientSelfRegistrationRequest = false;

  public TestOrder getLinkedOrder() {
    return _currentLinkedOrder;
  }

  public PatientLink getPatientLink() {
    return _currentPatientLink;
  }

  public Person getPatient() {
    return _currentPatient;
  }

  public Organization getOrganization() {
    return _organization;
  }

  public void setLinkedOrder(TestOrder currentLinkedOrder) {
    this._currentLinkedOrder = currentLinkedOrder;
  }

  public void setPatientLink(PatientLink currentPatientLink) {
    this._currentPatientLink = currentPatientLink;
  }

  public void setPatient(Person currentPatient) {
    this._currentPatient = currentPatient;
    this._organization = currentPatient.getOrganization();
  }

  public boolean hasPatientLink() {
    return _currentPatientLink != null;
  }

  public void setContext(
      PatientLink currentPatientLink, TestOrder currentLinkedOrder, Person currentPatient) {
    setLinkedOrder(currentLinkedOrder);
    setPatientLink(currentPatientLink);
    setPatient(currentPatient);
  }

  public boolean isPatientSelfRegistrationRequest() {
    return isPatientSelfRegistrationRequest;
  }

  public void setIsPatientSelfRegistrationRequest(boolean isPatientRegistrationRequest) {
    this.isPatientSelfRegistrationRequest = isPatientRegistrationRequest;
  }
}
