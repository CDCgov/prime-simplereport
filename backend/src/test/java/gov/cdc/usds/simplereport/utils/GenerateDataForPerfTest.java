package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@EnableAsync
@ActiveProfiles("test")
public class GenerateDataForPerfTest {

  @Autowired private TestDataFactory testDataFactory;

  public void generateTestEvents(int numberOfEvents, String fileName) {
    TestUserIdentities.withStandardUser(
        () -> {
          // Create a test organization
          Organization testOrg = testDataFactory.saveValidOrganization();

          // Create a test device type
          DeviceType testDeviceType =
              testDataFactory.createDeviceType("Test Device", "Test Manufacturer", "Test Model");

          // Create a test facility with the device type
          Facility testFacility = testDataFactory.createValidFacility(testOrg);
          testFacility.setDefaultDeviceTypeSpecimenType(
              testDeviceType, testDataFactory.getGenericSpecimen());

          // Create a test patient
          Person testPatient = testDataFactory.createFullPerson(testOrg);

          // Create a test user (ApiUser)
          // For this example, we'll just use the current user from TestUserIdentities
          ApiUser testUser = testDataFactory.getApiUserService().getCurrentUserInfo().getWrapped();

          // Prepare files and headers
          File personFile = new File(fileName + "_persons.csv");
          File orgFile = new File(fileName + "_orgs.csv");
          File facilityFile = new File(fileName + "_facilities.csv");
          File userFile = new File(fileName + "_users.csv");
          File deviceTypeFile = new File(fileName + "_device_types.csv");

          // Export device type
          try (FileWriter deviceTypeWriter = new FileWriter(deviceTypeFile)) {
            deviceTypeWriter.write(
                "internal_id,created_at,created_by,updated_at,updated_by,is_deleted,name,manufacturer,model,test_length\n");
            String deviceTypeCreatedAt =
                testDeviceType.getCreatedAt() != null
                    ? String.format("%tF %<tT", testDeviceType.getCreatedAt())
                    : "";
            String deviceTypeUpdatedAt =
                testDeviceType.getUpdatedAt() != null
                    ? String.format("%tF %<tT", testDeviceType.getUpdatedAt())
                    : "";
            deviceTypeWriter.write(
                String.format(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    testDeviceType.getInternalId(),
                    deviceTypeCreatedAt,
                    testDeviceType.getCreatedBy() != null
                        ? testDeviceType.getCreatedBy().getInternalId()
                        : "",
                    deviceTypeUpdatedAt,
                    testDeviceType.getUpdatedBy() != null
                        ? testDeviceType.getUpdatedBy().getInternalId()
                        : "",
                    false,
                    testDeviceType.getName(),
                    testDeviceType.getManufacturer(),
                    testDeviceType.getModel(),
                    testDeviceType.getTestLength()));
          } catch (IOException e) {
            throw new RuntimeException(e);
          }

          // Export organization
          try (FileWriter orgWriter = new FileWriter(orgFile)) {
            orgWriter.write(
                "internal_id,created_at,created_by,updated_at,updated_by,is_deleted,organization_name,organization_type,identity_verified,organization_external_id\n");
            String orgCreatedAt =
                testOrg.getCreatedAt() != null
                    ? String.format("%tF %<tT", testOrg.getCreatedAt())
                    : "";
            String orgUpdatedAt =
                testOrg.getUpdatedAt() != null
                    ? String.format("%tF %<tT", testOrg.getUpdatedAt())
                    : "";
            orgWriter.write(
                String.format(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    testOrg.getInternalId(),
                    orgCreatedAt,
                    testOrg.getCreatedBy() != null ? testOrg.getCreatedBy().getInternalId() : "",
                    orgUpdatedAt,
                    testOrg.getUpdatedBy() != null ? testOrg.getUpdatedBy().getInternalId() : "",
                    false,
                    testOrg.getOrganizationName(),
                    testOrg.getOrganizationType(),
                    true,
                    testOrg.getExternalId() != null
                        ? testOrg.getExternalId()
                        : testOrg.getInternalId().toString()));
          } catch (IOException e) {
            throw new RuntimeException(e);
          }

          // Export facility
          try (FileWriter facilityWriter = new FileWriter(facilityFile)) {
            facilityWriter.write(
                "internal_id,created_at,created_by,updated_at,updated_by,is_deleted,organization_id,facility_name,clia_number,default_device_type_id,street,city,county,state,postal_code,telephone\n");
            String facCreatedAt =
                testFacility.getCreatedAt() != null
                    ? String.format("%tF %<tT", testFacility.getCreatedAt())
                    : "";
            String facUpdatedAt =
                testFacility.getUpdatedAt() != null
                    ? String.format("%tF %<tT", testFacility.getUpdatedAt())
                    : "";
            facilityWriter.write(
                String.format(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    testFacility.getInternalId(),
                    facCreatedAt,
                    testFacility.getCreatedBy() != null
                        ? testFacility.getCreatedBy().getInternalId()
                        : "",
                    facUpdatedAt,
                    testFacility.getUpdatedBy() != null
                        ? testFacility.getUpdatedBy().getInternalId()
                        : "",
                    false,
                    testFacility.getOrganization().getInternalId(),
                    testFacility.getFacilityName(),
                    testFacility.getCliaNumber(),
                    testFacility.getDefaultDeviceType() != null
                        ? testFacility.getDefaultDeviceType().getInternalId()
                        : "",
                    "", // street (array)
                    "", // city
                    "", // county
                    "", // state
                    "", // postal_code
                    "" // telephone
                    ));
          } catch (IOException e) {
            throw new RuntimeException(e);
          }

          // Export person (patient)
          try (FileWriter personWriter = new FileWriter(personFile)) {
            personWriter.write(
                "internal_id,created_at,created_by,updated_at,updated_by,is_deleted,organization_id,facility_id,first_name,middle_name,last_name,suffix,race,gender,ethnicity,lookup_id,birth_date,street,city,county,state,postal_code,email,employed_in_healthcare,role,resident_congregate_setting,tribal_affiliation,country,preferred_language,test_result_delivery_preference,emails,gender_identity\n");
            String perCreatedAt =
                testPatient.getCreatedAt() != null
                    ? String.format("%tF %<tT", testPatient.getCreatedAt())
                    : "";
            String perUpdatedAt =
                testPatient.getUpdatedAt() != null
                    ? String.format("%tF %<tT", testPatient.getUpdatedAt())
                    : "";
            String perBirthDate =
                testPatient.getBirthDate() != null ? testPatient.getBirthDate().toString() : "";
            personWriter.write(
                String.format(
                    "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                    testPatient.getInternalId(),
                    perCreatedAt,
                    testPatient.getCreatedBy() != null
                        ? testPatient.getCreatedBy().getInternalId()
                        : "",
                    perUpdatedAt,
                    testPatient.getUpdatedBy() != null
                        ? testPatient.getUpdatedBy().getInternalId()
                        : "",
                    false,
                    testPatient.getOrganization().getInternalId(),
                    testPatient.getFacility() != null
                        ? testPatient.getFacility().getInternalId()
                        : "",
                    testPatient.getNameInfo() != null
                        ? testPatient.getNameInfo().getFirstName()
                        : "",
                    testPatient.getNameInfo() != null
                        ? testPatient.getNameInfo().getMiddleName()
                        : "",
                    testPatient.getNameInfo() != null
                        ? testPatient.getNameInfo().getLastName()
                        : "",
                    testPatient.getNameInfo() != null ? testPatient.getNameInfo().getSuffix() : "",
                    testPatient.getRace(),
                    testPatient.getGender(),
                    testPatient.getEthnicity(),
                    testPatient.getLookupId(),
                    perBirthDate,
                    "", // street (array)
                    "", // city
                    "", // county
                    "", // state
                    "", // postal_code
                    testPatient.getEmail(),
                    testPatient.getEmployedInHealthcare() != null
                        ? testPatient.getEmployedInHealthcare().toString()
                        : "false",
                    testPatient.getRole() != null ? testPatient.getRole().toString() : "",
                    testPatient.getResidentCongregateSetting() != null
                        ? testPatient.getResidentCongregateSetting().toString()
                        : "false",
                    "{}", // tribal_affiliation (array)
                    testPatient.getCountry(),
                    testPatient.getPreferredLanguage(),
                    testPatient.getTestResultDelivery() != null
                        ? testPatient.getTestResultDelivery().toString()
                        : "",
                    testPatient.getEmails() != null
                        ? "{" + String.join(",", testPatient.getEmails()) + "}"
                        : "{}",
                    testPatient.getGenderIdentity()));
          } catch (IOException e) {
            throw new RuntimeException(e);
          }

          // Export user (ApiUser)
          if (testUser != null) {
            try (FileWriter userWriter = new FileWriter(userFile)) {
              userWriter.write(
                  "internal_id,created_at,updated_at,login_email,last_seen,first_name,middle_name,last_name\n");
              String userCreatedAt =
                  testUser.getCreatedAt() != null
                      ? String.format("%tF %<tT", testUser.getCreatedAt())
                      : "";
              String userUpdatedAt =
                  testUser.getUpdatedAt() != null
                      ? String.format("%tF %<tT", testUser.getUpdatedAt())
                      : "";
              String userLastSeen =
                  testUser.getLastSeen() != null
                      ? String.format("%tF %<tT", testUser.getLastSeen())
                      : "";
              userWriter.write(
                  String.format(
                      "%s,%s,%s,%s,%s,%s,%s,%s\n",
                      testUser.getInternalId(),
                      userCreatedAt,
                      userUpdatedAt,
                      testUser.getLoginEmail(),
                      userLastSeen,
                      testUser.getNameInfo() != null ? testUser.getNameInfo().getFirstName() : "",
                      testUser.getNameInfo() != null ? testUser.getNameInfo().getMiddleName() : "",
                      testUser.getNameInfo() != null ? testUser.getNameInfo().getLastName() : ""));
            } catch (IOException e) {
              throw new RuntimeException(e);
            }
          }

          File eventFile = new File(fileName + "_events.csv");
          File orderFile = new File(fileName + "_orders.csv");

          // Generate all events and orders first
          TestEvent[] events = new TestEvent[numberOfEvents];
          TestOrder[] orders = new TestOrder[numberOfEvents];

          for (int i = 0; i < numberOfEvents; i++) {
            TestEvent event = testDataFactory.createTestEvent(testPatient, testFacility);
            TestOrder order = event.getTestOrder();
            events[i] = event;
            orders[i] = order;
          }

          // Write all events to CSV
          try (FileWriter testEventWriter = new FileWriter(eventFile)) {
            testEventWriter.write(
                "internal_id,organization_id,facility_id,patient_id,created_at,created_by,updated_at,updated_by,test_order_id,correction_status,reason_for_correction\n");
            for (TestEvent event : events) {
              TestOrder order = event.getTestOrder();
              // Pre-format date fields as strings, handling nulls
              String createdAtStr =
                  event.getCreatedAt() != null
                      ? String.format("%tF %<tT", event.getCreatedAt())
                      : "";
              String updatedAtStr =
                  event.getUpdatedAt() != null
                      ? String.format("%tF %<tT", event.getUpdatedAt())
                      : "";
              // Write test event record
              String testEventLine =
                  String.format(
                      "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                      event.getInternalId(),
                      event.getOrganization().getInternalId(),
                      event.getFacility().getInternalId(),
                      event.getPatient().getInternalId(),
                      createdAtStr,
                      event.getCreatedBy() != null ? event.getCreatedBy().getInternalId() : "",
                      updatedAtStr,
                      event.getUpdatedBy() != null ? event.getUpdatedBy().getInternalId() : "",
                      order.getInternalId(),
                      event.getCorrectionStatus() != null
                          ? event.getCorrectionStatus().toString()
                          : "",
                      event.getReasonForCorrection() != null ? event.getReasonForCorrection() : "");
              testEventWriter.write(testEventLine);
            }
          } catch (IOException e) {
            throw new RuntimeException("Error writing events to CSV file", e);
          }

          // Write all orders to CSV
          try (FileWriter testOrderWriter = new FileWriter(orderFile)) {
            testOrderWriter.write(
                "internal_id,organization_id,facility_id,patient_id,created_at,created_by,updated_at,updated_by,order_status,test_event_id\n");
            for (TestOrder order : orders) {
              // Pre-format date fields as strings, handling nulls
              String orderCreatedAtStr =
                  order.getCreatedAt() != null
                      ? String.format("%tF %<tT", order.getCreatedAt())
                      : "";
              String orderUpdatedAtStr =
                  order.getUpdatedAt() != null
                      ? String.format("%tF %<tT", order.getUpdatedAt())
                      : "";
              // Write corresponding test order record
              String testOrderLine =
                  String.format(
                      "%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                      order.getInternalId(),
                      order.getOrganization().getInternalId(),
                      order.getFacility().getInternalId(),
                      order.getPatient().getInternalId(),
                      orderCreatedAtStr,
                      order.getCreatedBy() != null ? order.getCreatedBy().getInternalId() : "",
                      orderUpdatedAtStr,
                      order.getUpdatedBy() != null ? order.getUpdatedBy().getInternalId() : "",
                      order.getOrderStatus() != null ? order.getOrderStatus().toString() : "",
                      //                        order.getTestEvent() != null ?
                      // order.getTestEvent().getInternalId() : ""
                      "");
              testOrderWriter.write(testOrderLine);
            }
          } catch (IOException e) {
            throw new RuntimeException("Error writing orders to CSV file", e);
          }
        });
  }

  //    This is a simple test that can be run to generate N rows of test data. It's disabled by
  // default
  //    It was built this way because that means we have the full context of the app and can rely on
  // H2's constraints
  //    to ensure data integrity
  @Disabled
  @Test
  public void testGenerate100000Events() {
    //    generateTestEvents(1000, "1000");
  }
}
