package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.EnumSet;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.util.LinkedMultiValueMap;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
@Disabled(
    "This test has been disabled because spring-boot-starter-graphql/spring-graphql-test doesnt support multipart, this will be removed when we switch to rest for uploads")
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
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.READ_ARCHIVED_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.EDIT_FACILITY,
            UserPermission.EDIT_ORGANIZATION,
            UserPermission.MANAGE_USERS,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.ACCESS_ALL_FACILITIES,
            UserPermission.VIEW_ARCHIVED_FACILITIES),
        null);
  }

  private JsonNode uploadPatients() throws IOException {
    LinkedMultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
    parts.add(
        "operations",
        new HttpEntity<>(
            "{\"operationName\":\"UploadPatients\",\"variables\":{\"patientList\":null},\"query\":\"mutation"
                + " UploadPatients($patientList: Upload!) {\n"
                + "  uploadPatients(patientList: $patientList)\n"
                + "}\n"
                + "\"}",
            new HttpHeaders()));
    parts.add("map", new HttpEntity<>("{\"1\":[\"variables.patientList\"]}", new HttpHeaders()));
    HttpHeaders csvHeaders = new HttpHeaders();
    csvHeaders.setContentType(MediaType.parseMediaType("text/csv"));
    parts.add(
        "1",
        new HttpEntity<>(
            "LastName,FirstName,MiddleName,Suffix,Race,DOB,biologicalSex,Ethnicity,Street,Street2,City"
                + " ,County,State,ZipCode,Country,PhoneNumber,employedInHealthcare,residentCongregateSetting,Role,Email,facilityId\n"
                + "Best,Tim,,,White,5/11/1933,Male,Not_Hispanic,123 Main"
                + " Street,,Washington,,DC,20008,USA,5656667777,Yes,No,Staff,foo@example.com,",
            csvHeaders));
    return (JsonNode) runMultipart(parts);
  }
}
