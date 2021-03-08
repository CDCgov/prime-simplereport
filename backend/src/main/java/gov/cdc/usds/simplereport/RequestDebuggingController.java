package gov.cdc.usds.simplereport;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/echo")
@Profile(BeanProfiles.SERVER_DEBUG)
public class RequestDebuggingController {

  @GetMapping("/headers")
  public Object echoHeaders(HttpServletRequest req) {
    Map<String, List<String>> headers = new HashMap<>();
    Enumeration<String> names = req.getHeaderNames();
    while (names.hasMoreElements()) {
      String header = names.nextElement();
      Enumeration<String> values = req.getHeaders(header);
      List<String> headerValues = new ArrayList<>();
      while (values.hasMoreElements()) {
        headerValues.add(values.nextElement());
      }
      headers.put(header, headerValues);
    }
    return headers;
  }

  @RequestMapping
  public Map<String, Object> echoBasics(HttpServletRequest req) {
    Map<String, Object> deets = new HashMap<>();
    deets.put("remoteAddr", req.getRemoteAddr());
    deets.put("parameters", req.getParameterMap());
    deets.put("scheme", req.getScheme());
    deets.put("requestUri", req.getRequestURI());
    deets.put("serverName", req.getServerName());
    deets.put("serverPort", req.getServerPort());
    deets.put("method", req.getMethod());
    return deets;
  }

  @GetMapping("/attributes")
  public Map<String, Object> partialEcho(HttpServletRequest req) {
    Map<String, Object> attributes = new HashMap<>();
    Enumeration<String> names = req.getAttributeNames();
    while (names.hasMoreElements()) {
      String name = names.nextElement();
      Object value = req.getAttribute(name);
      attributes.put(name, value != null ? value.toString() : null);
    }
    return attributes;
  }
}
