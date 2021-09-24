package gov.cdc.usds.simplereport.db.model.auxiliary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;
import org.springframework.boot.test.json.ObjectContent;

@JsonTest
class HttpRequestDetailsSerializationTest {

  @Autowired private JacksonTester<HttpRequestDetails> _tester;

  @Test
  void serialize_fullObject_allFieldsFound() throws IOException {
    HttpRequestDetails obj =
        new HttpRequestDetails(
            "some.cloud.host",
            "192.168.3.253",
            List.of("192.168.251.2:80", "10.240.32.158:443"),
            "http",
            "simplereport.us",
            "/reboot");
    JsonContent<HttpRequestDetails> written = _tester.write(obj);
    assertThat(written).extractingJsonPathStringValue("forwardedProtocol").isEqualTo("http");
    assertThat(written).extractingJsonPathStringValue("remoteAddress").isEqualTo("192.168.3.253");
    assertThat(written)
        .extractingJsonPathStringValue("originalHostName")
        .isEqualTo("simplereport.us");
    assertThat(written).extractingJsonPathStringValue("requestUri").isEqualTo("/reboot");
    assertThat(written).extractingJsonPathStringValue("serverName").isEqualTo("some.cloud.host");
    assertThat(written)
        .extractingJsonPathArrayValue("forwardedAddresses")
        .isEqualTo(List.of("192.168.251.2:80", "10.240.32.158:443"));
  }

  @Test
  // IF THIS TEST BREAKS YOU HAVE BROKEN THE DATABASE AUDIT log. FIX THE MODEL, NOT THE TEST.
  void deserialize_fullValues_allFieldsSet() throws IOException {
    ObjectContent<HttpRequestDetails> val =
        _tester.read("/deserialization/http-request-details/full.json");
    HttpRequestDetails obj = val.getObject();
    assertNotNull(obj);
    assertEquals("my.private.cloud", obj.getServerName());
    assertEquals("192.168.33.23", obj.getRemoteAddress());
    assertEquals("/die/die/die", obj.getRequestUri());
    assertEquals("gopher", obj.getForwardedProtocol());
    assertEquals("simplereport.int", obj.getOriginalHostName());
    assertEquals(
        List.of("192.168.251.2:80", "10.240.32.158:443", "127.138.220.0:80"),
        obj.getForwardedAddresses());
  }

  @Test
  // IF THIS TEST BREAKS YOU HAVE BROKEN THE DATABASE AUDIT log. FIX THE MODEL, NOT THE TEST.
  void deserialize_partialValues_correctFieldsSet() throws IOException {
    ObjectContent<HttpRequestDetails> val =
        _tester.read("/deserialization/http-request-details/partial.json");
    HttpRequestDetails obj = val.getObject();
    assertNotNull(obj);
    assertEquals("my.private.cloud", obj.getServerName());
    assertEquals("192.168.33.23", obj.getRemoteAddress());
    assertEquals("/die/die/die", obj.getRequestUri());
    assertNull(obj.getForwardedProtocol());
    assertNull(obj.getOriginalHostName());
    assertNull(obj.getForwardedAddresses());
  }
}
