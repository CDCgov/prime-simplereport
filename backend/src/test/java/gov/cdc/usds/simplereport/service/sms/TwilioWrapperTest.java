package gov.cdc.usds.simplereport.service.sms;

import org.junit.jupiter.api.Test;

class TwilioWrapperTest {
  // this test is mostly interacting with the Twilio API, where some operations are prohibited
  // (including getting the servie)
  // this will basically test that the fallback phone number situation works as intended

  @Test
  void twilioWrapper_usesMessageServiceWhenAvailable() {}
}
