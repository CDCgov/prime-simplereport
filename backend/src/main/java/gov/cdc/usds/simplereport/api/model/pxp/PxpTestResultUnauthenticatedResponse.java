package gov.cdc.usds.simplereport.api.model.pxp;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class PxpTestResultUnauthenticatedResponse {
  private Person person;
  private Facility facility;
  private PatientLink pl;

  public PxpTestResultUnauthenticatedResponse(Person person, Facility facility, PatientLink pl) {
    this.person = person;
    this.facility = facility;
    this.pl = pl;
  }

  public Map<String, String> getPatient() {
    HashMap<String, String> patientMap = new HashMap<>();
    patientMap.put("firstName", person.getFirstName());
    patientMap.put("lastName", person.getLastName().charAt(0) + ".");

    return patientMap;
  }

  public Map<String, String> getFacility() {
    HashMap<String, String> facilityMap = new HashMap<>();
    facilityMap.put("name", facility.getFacilityName());
    facilityMap.put("phone", facility.getTelephone());

    return facilityMap;
  }

  public Date getExpiresAt() {
    return pl.getExpiresAt();
  }
}
