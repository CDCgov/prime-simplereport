package gov.cdc.usds.simplereport.service.sms;

import static org.mockito.Mockito.verify;

import com.google.i18n.phonenumbers.NumberParseException;
import com.twilio.type.PhoneNumber;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.PatientLinkService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

class SmsServiceTest extends BaseServiceTest<SmsService> {
  @MockBean
  SmsProviderWrapper mockTwilio;

  @Autowired
  DbTruncator _truncator;

  @Autowired
  SmsService _smsService;

  @Autowired
  PatientLinkService _patientLinkService;

  Person _person;
  PatientLink _patientLink;
  String _patientLinkId;

  @BeforeEach
  void setupData() {
      initSampleData();
      Organization org = _dataFactory.createValidOrg();
      Facility site = _dataFactory.createValidFacility(org);
      _person = _dataFactory.createFullPerson(org);
      TestOrder to = _dataFactory.createTestOrder(_person, site);
      _patientLink = _patientLinkService.createPatientLink(to.getInternalId());
      _patientLinkId = _patientLink.getInternalId().toString();
  }

  @Captor
  ArgumentCaptor<PhoneNumber> fromNumber;

  @Captor
  ArgumentCaptor<PhoneNumber> toNumber;

  @Captor
  ArgumentCaptor<String> message;

  @Test
  @Disabled
  @WithSimpleReportSiteAdminUser
  void sendPatientLinkSms() throws NumberParseException {
    // GIVEN
    // WHEN
    _smsService.sendToPatientLink(_patientLinkId, "yup here we are, testing stuff");

    // THEN
    verify(mockTwilio, times(1)).send(toNumber.capture(), fromNumber.capture(), message.capture());
    assertEquals(toNumber, _smsService.formatNumber(_person.getTelephone()));
  }
}
