package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.EnumSet;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;

class PatientUploadTest extends BaseGraphqlTest {
  public static final int PATIENT_PAGEOFFSET = 0;
  public static final int PATIENT_PAGESIZE = 1000;

  @Test
  void uploadPatientCSV() throws Exception {
    useSuperUserWithOrg();
    JsonNode response = uploadPatients();
    assertEquals(
        "\"Successfully uploaded 1 record(s)\"", response.get("uploadPatients").toString());
    assertLastAuditEntry(
        TestUserIdentities.SITE_ADMIN_USER_WITH_ORG,
        "UploadPatients",
        EnumSet.allOf(UserPermission.class),
        null);
  }

  private JsonNode uploadPatients() throws IOException {
    LinkedMultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
    parts.add(
        "operations",
        new HttpEntity<>(
            "{\"operationName\":\"UploadPatients\",\"variables\":{\"patientList\":null},\"query\":\"mutation UploadPatients($patientList: Upload!) {\n  uploadPatients(patientList: $patientList)\n}\n\"}",
            new HttpHeaders()));
    parts.add("map", new HttpEntity<>("{\"1\":[\"variables.patientList\"]}", new HttpHeaders()));
    HttpHeaders csvHeaders = new HttpHeaders();
    csvHeaders.setContentType(MediaType.parseMediaType("text/csv"));
    parts.add(
        "1",
        new HttpEntity<>(
            "LastName,FirstName,MiddleName,Suffix,Race,DOB,biologicalSex,Ethnicity,Street,Street2,City ,County,State,ZipCode,PhoneNumber,employedInHealthcare,residentCongregateSetting,Role,Email,facilityId\n"
                + "Best,Tim,,,White,5/11/1933,Male,Not_Hispanic,123 Main Street,,Washington,,DC,20008,5656667777,Yes,No,Staff,foo@example.com,",
            csvHeaders));
    return (JsonNode) runMultipart(parts);
  }
}
