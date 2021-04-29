package gov.cdc.usds.simplereport.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class DummyCatchAllController {
  @RequestMapping(path = "/**")
  @ResponseBody
  public String catchAll() {
    System.out.println("in catchAll method");
    return "DummyCatchallController#catchAll";
  }
}
