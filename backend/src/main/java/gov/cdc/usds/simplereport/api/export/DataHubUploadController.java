package gov.cdc.usds.simplereport.api.export;

import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.service.DataHubUploaderService;
import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/** Created by tomn on 11Dec2020 */
@RestController
@RequestMapping(value = "/export")
@Validated
public class DataHubUploadController {

  private final DataHubUploaderService _hubuploadservice;

  public DataHubUploadController(DataHubUploaderService us) {
    this._hubuploadservice = us;
  }

  @GetMapping(value = "/uploadTestEvent", produces = MediaType.APPLICATION_JSON_VALUE)
  public String uploadTestEventCSVToDataHub(
      @RequestParam String apikey, @RequestParam(defaultValue = "") String startupdateby)
      throws IOException {
    Map<String, String> result =
        _hubuploadservice.uploadTestEventCSVToDataHub(apikey, startupdateby);
    ObjectMapper mapperObj = new ObjectMapper();
    return mapperObj.writeValueAsString(result);
  }

  @GetMapping(
      value = "/testEvent",
      produces = {"text/csv"})
  public ResponseEntity<?> exportTestEventCSV(
      HttpServletResponse response, @RequestParam(defaultValue = "") String organizationExternalId)
      throws IOException {
    var csvContent = _hubuploadservice.createTestCSVForDataHub(organizationExternalId);

    response.setContentType("text/csv");
    DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH-mm-ss");
    String currentDateTime = dateFormatter.format(new Date());

    String headerKey = "Content-Disposition";
    String headerValue = "attachment; filename=testEvents_" + currentDateTime + ".csv";
    response.setHeader(headerKey, headerValue);
    response.getWriter().print(csvContent);
    return ResponseEntity.accepted().build();
  }
}
