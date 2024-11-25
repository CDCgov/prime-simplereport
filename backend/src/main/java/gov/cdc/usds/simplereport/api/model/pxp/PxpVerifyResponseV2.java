package gov.cdc.usds.simplereport.api.model.pxp;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.SupportedDiseaseTestResult;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashSet;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
public class PxpVerifyResponseV2 {

  private final UUID testEventId;
  private final Set<SupportedDiseaseTestResult> results;
  private final Date dateTested;
  private final String correctionStatus;
  private final Patient patient;
  private final Organization organization;
  private final Facility facility;
  private final DeviceTypeWrapper deviceType;

  public PxpVerifyResponseV2(Person person, TestEvent testEvent) {

    this.testEventId = testEvent.getInternalId();
    Set<Result> allResults = testEvent.getResults();
    if (allResults.isEmpty()) {
      throw new NoSuchElementException("No test results found.");
    }
    results = new HashSet<>();
    allResults.forEach(
        r -> {
          results.add(r.getDiseaseResult());
        });
    this.dateTested = testEvent.getDateTested();
    this.correctionStatus = testEvent.getCorrectionStatus().toString();

    this.patient =
        Patient.builder()
            .firstName(person.getFirstName())
            .middleName(person.getMiddleName())
            .lastName(person.getLastName())
            .birthDate(person.getBirthDate())
            .build();

    this.organization =
        Organization.builder().name(person.getOrganization().getOrganizationName()).build();

    this.deviceType =
        DeviceTypeWrapper.builder()
            .name(testEvent.getDeviceType().getName())
            .model(testEvent.getDeviceType().getModel())
            .build();

    this.facility =
        Facility.builder()
            .name(testEvent.getFacility().getFacilityName())
            .cliaNumber(testEvent.getFacility().getCliaNumber())
            .street(testEvent.getFacility().getAddress().getStreetOne())
            .streetTwo(testEvent.getFacility().getAddress().getStreetTwo())
            .city(testEvent.getFacility().getAddress().getCity())
            .state(testEvent.getFacility().getAddress().getState())
            .zipCode(testEvent.getFacility().getAddress().getPostalCode())
            .phone(testEvent.getFacility().getTelephone())
            .orderingProvider(
                Facility.OrderingProvider.builder()
                    .firstName(
                        testEvent
                            .getFacility()
                            .getDefaultOrderingProvider()
                            .getNameInfo()
                            .getFirstName())
                    .middleName(
                        testEvent
                            .getFacility()
                            .getDefaultOrderingProvider()
                            .getNameInfo()
                            .getMiddleName())
                    .lastName(
                        testEvent
                            .getFacility()
                            .getDefaultOrderingProvider()
                            .getNameInfo()
                            .getLastName())
                    .npi(testEvent.getFacility().getDefaultOrderingProvider().getProviderId())
                    .build())
            .build();
  }

  @Builder
  @Getter
  public static class DeviceTypeWrapper {
    private String name;
    private String model;
  }

  @Builder
  @Getter
  public static class Facility {
    private String name;
    private String cliaNumber;
    private String street;
    private String streetTwo;
    private String city;
    private String state;
    private String zipCode;
    private String phone;
    private OrderingProvider orderingProvider;

    @Builder
    @Getter
    public static class OrderingProvider {
      private String firstName;
      private String lastName;
      private String middleName;
      private String npi;
    }
  }

  @Builder
  @Getter
  public static class Organization {
    private String name;
  }

  @Builder
  @Getter
  public static class Patient {
    private String firstName;
    private String lastName;
    private String middleName;
    private LocalDate birthDate;
  }
}
