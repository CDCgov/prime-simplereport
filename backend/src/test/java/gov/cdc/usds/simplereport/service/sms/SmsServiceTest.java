package gov.cdc.usds.simplereport.service.sms;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.google.i18n.phonenumbers.NumberParseException;
import com.twilio.type.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;

class SmsServiceTest extends BaseServiceTest<SmsService> {
  @MockBean SmsProviderWrapper mockTwilio;

  @Autowired DbTruncator _truncator;

  @Autowired SmsService _smsService;

  @Autowired OrganizationService _organizationService;

  Organization _org;
  Facility _site;
  Person _person;
  PatientLink _patientLink;
  String _patientLinkId;

  @BeforeEach
  void setupData() {
    initSampleData();
    _org = _organizationService.getCurrentOrganization();
    _site = _dataFactory.createValidFacility(_org);
  }

  void createTestOrderAndPatientLink(Person person) {
    TestOrder to = _dataFactory.createTestOrder(person, _site);
    _patientLink = _dataFactory.createPatientLink(to);
    _patientLinkId = _patientLink.getInternalId().toString();
  }

  @Captor ArgumentCaptor<PhoneNumber> fromNumber;

  @Captor ArgumentCaptor<PhoneNumber> toNumber;

  @Captor ArgumentCaptor<String> message;

  @Test
  @WithSimpleReportEntryOnlyAllFacilitiesUser
  void sendPatientLinkSms_entryOnlyAllFacilitiesUser_success() throws NumberParseException {
    // GIVEN
    _person = _dataFactory.createFullPerson(_org);
    createTestOrderAndPatientLink(_person);

    // WHEN
    _smsService.sendToPatientLink(_patientLinkId, "yup here we are, testing stuff");

    // THEN
    verify(mockTwilio, times(1)).send(toNumber.capture(), fromNumber.capture(), message.capture());
    assertEquals(
        toNumber.getValue(), new PhoneNumber(_smsService.formatNumber(_person.getTelephone())));
  }

  @Test
  @WithSimpleReportStandardUser
  void sendPatientLinkSms_standardUser_successDependsOnFacilityAccess()
      throws NumberParseException {
    // GIVEN
    _person = _dataFactory.createFullPerson(_org);
    createTestOrderAndPatientLink(_person);

    // WHEN + THEN
    assertThrows(
        AccessDeniedException.class,
        () -> _smsService.sendToPatientLink(_patientLinkId, "yup here we are, testing stuff"));

    // GIVEN
    TestUserIdentities.setFacilityAuthorities(_site);

    // WHEN + THEN (confirm there is no exception thrown)
    _smsService.sendToPatientLink(_patientLinkId, "yup here we are, testing stuff");
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void sendPatientLinkSmsThrowsOnBadNumber() throws NumberParseException {
    // GIVEN
    _person = _dataFactory.createFullPersonWithTelephone(_org, "ABCD THIS ISN'T A PHONE NUMBER");
    createTestOrderAndPatientLink(_person);

    // WHEN + THEN
    assertThrows(
        NumberParseException.class,
        () -> {
          _smsService.sendToPatientLink(_patientLinkId, "yup here we are, testing stuff");
        });
  }
}
