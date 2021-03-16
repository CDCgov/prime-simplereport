package gov.cdc.usds.simplereport.db.model.auxiliary;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

public class HttpRequestDetailsTest {

  @Test
  void constructFromRequest_minimalRequest_validObject() {
    MockHttpServletRequest req = new MockHttpServletRequest("GET", "/foobar");
    HttpRequestDetails obj = new HttpRequestDetails(req);
    assertEquals("/foobar", obj.getRequestUri());
    assertEquals(List.of(), obj.getForwardedAddresses());
    assertNull(obj.getForwardedProtocol());
    assertEquals("127.0.0.1", obj.getRemoteAddress());
    assertNull(obj.getOriginalHostName());
    assertEquals("localhost", obj.getServerName());
  }

  @Test
  void constructFromRequest_withHeaders_valuesOK() {
    MockHttpServletRequest req = new MockHttpServletRequest("GET", "/gimmedata");
    req.setRemoteAddr("127.3.23.183");
    req.addHeader("Host", "internal.mycloud.hax");
    req.addHeader("x-original-host", "simplereport.info");
    req.addHeader("x-forwarded-for", "192.168.3.2:3245, 10.0.0.3:23415");
    req.addHeader("x-forwarded-proto", "gopher");
    HttpRequestDetails obj = new HttpRequestDetails(req);
    assertEquals("/gimmedata", obj.getRequestUri());
    assertEquals("internal.mycloud.hax", obj.getServerName());
    assertEquals("127.3.23.183", obj.getRemoteAddress());
    assertEquals("gopher", obj.getForwardedProtocol());
    assertEquals("simplereport.info", obj.getOriginalHostName());
    assertEquals(List.of("192.168.3.2:3245", "10.0.0.3:23415"), obj.getForwardedAddresses());
  }

  @Test
  void constructFromFields_sillyValues_validObject() {
    HttpRequestDetails obj =
        new HttpRequestDetails(
            "george",
            "192.168.1.2",
            List.of("10.0.0.1:80", "1.2.3.4:5"),
            "sftp",
            "example.com",
            "/reboot");
    assertEquals("george", obj.getServerName());
    assertEquals("192.168.1.2", obj.getRemoteAddress());
    assertEquals(List.of("10.0.0.1:80", "1.2.3.4:5"), obj.getForwardedAddresses());
    assertEquals("sftp", obj.getForwardedProtocol());
    assertEquals("example.com", obj.getOriginalHostName());
    assertEquals("/reboot", obj.getRequestUri());
  }

  @Test
  void constructFromFields_nulls_validObject() {
    HttpRequestDetails obj = new HttpRequestDetails(null, null, null, null, null, null);
    assertNull(obj.getServerName());
    assertNull(obj.getRemoteAddress());
    assertNull(obj.getRequestUri());
    assertNull(obj.getForwardedAddresses());
    assertNull(obj.getOriginalHostName());
    assertNull(obj.getForwardedProtocol());
  }
}
