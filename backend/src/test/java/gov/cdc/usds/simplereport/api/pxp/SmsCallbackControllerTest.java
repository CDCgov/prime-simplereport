package gov.cdc.usds.simplereport.api.pxp;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.bind.DatatypeConverter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

public class SmsCallbackControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  @Value("${TWILIO_AUTH_TOKEN:MISSING}")
  private String twilioAuthToken;

  @Test
  void badTwilioVerification() throws Exception {
    String requestBody = "food=hamburger&drink=coffee";
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.TWILIO_CALLBACK)
            .header("X-Twilio-Signature", "bad-signature")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  void successfulCallback() throws Exception {
    String requestBody = "food=hamburger&drink=coffee";

    String signature = createSignature(Map.of("food", "hamburger", "drink", "coffee"));

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.TWILIO_CALLBACK)
            .header("X-Twilio-Signature", signature)
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  private String createSignature(Map<String, String> params) throws Exception {
    StringBuilder builder = new StringBuilder(twilioCallbackUrl);
    if (params != null) {
      List<String> sortedKeys = new ArrayList<String>(params.keySet());
      Collections.sort(sortedKeys);

      for (String key : sortedKeys) {
        builder.append(key);
        String value = params.get(key);
        builder.append(value == null ? "" : value);
      }
    }

    Mac mac = Mac.getInstance("HmacSHA1");
    mac.init(new SecretKeySpec(twilioAuthToken.getBytes(), "HmacSHA1"));
    byte[] rawHmac = mac.doFinal(builder.toString().getBytes(StandardCharsets.UTF_8));
    return DatatypeConverter.printBase64Binary(rawHmac);
  }
}
