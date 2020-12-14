package gov.cdc.usds.simplereport.api.export;

import gov.cdc.usds.simplereport.service.DataHubUploaderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;


/**
 * Created by tomn on 11Dec2020
 */
@RestController
@RequestMapping(value = "/export")
@Validated
public class DataHubUploadController {

    private final DataHubUploaderService _hubuploadservice;

    public DataHubUploadController(DataHubUploaderService us) {
        this._hubuploadservice = us;
    }
    @GetMapping(value = "/uploadTestEvent")
    public String uploadTestEventCSVToDataHub(@RequestParam String apikey,
                                              @RequestParam(defaultValue = "") String startupdateby
    ) throws IOException {
        String result = _hubuploadservice.uploadTestEventCVSToDataHub(apikey, startupdateby);
        return result;
    }
}
