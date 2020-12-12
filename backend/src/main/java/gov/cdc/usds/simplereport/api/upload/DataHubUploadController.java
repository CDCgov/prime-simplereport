package gov.cdc.usds.simplereport.api.upload;


import gov.cdc.usds.simplereport.service.DataHubUploaderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.Optional;

import static gov.cdc.usds.simplereport.api.Translators.parseUserDate;

/**
 * Created by tomn on 11Dec2020
 */
@RestController
@RequestMapping(value = "/upload")
@Validated
public class DataHubUploadController {

    private final DataHubUploaderService _hubuploadservice;

    public DataHubUploadController(DataHubUploaderService us) {
        this._hubuploadservice = us;
    }

    @GetMapping("/testEventsUploadDataHub")
    @ResponseBody
    public String uploadTestEventCSVToDataHub(@RequestParam String apikey,
                                              @RequestParam(defaultValue = "") String startupdateby
    ) throws IOException {
//        LocalDate dateForReport = (startupdateby.length() != 0) ?
//                parseUserDate(startupdateby) :
//                LocalDate.ofInstant(Instant.now().minus(1, ChronoUnit.DAYS), ZoneOffset.UTC);
//
//        Date.from(dateForReport.atStartOfDay(defaultZoneId).toInstant());
        String result = _hubuploadservice.uploadTestEventCVSToDataHub(apikey, startupdateby);
        return "Result: {}";
    }
}
