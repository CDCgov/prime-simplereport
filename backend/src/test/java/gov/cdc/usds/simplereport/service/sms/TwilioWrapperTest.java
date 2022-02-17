package gov.cdc.usds.simplereport.service.sms;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.twilio.rest.messaging.v1.Service;
import com.twilio.rest.messaging.v1.ServiceFetcher;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"twilio.messaging-service-sid=foo"})
@TestPropertySource(properties = {"twilio.from-number=7608675309"})
class TwilioWrapperTest {
  // this test is mostly interacting with the Twilio API, where some operations are prohibited
  // (including getting the service)
  // this will basically test that the fallback phone number situation works as intended

  @Test
  void twilioWrapper_usesMessageServiceWhenAvailable() {
    var twilioServiceFetcher = mock(ServiceFetcher.class);
    var twilioService = mock(Service.class);
    when(twilioServiceFetcher.fetch(any())).thenReturn(twilioService);

    TwilioWrapper wrapper = new TwilioWrapper();
  }
}
