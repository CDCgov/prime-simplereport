package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.RaceArrayConverter;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@Transactional
public class DataHubUploaderService {
    static final String DUMMY_UPLOAD_URL = "https://prime-data-hub-test.azurefd.net/api/reports";
    private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);


    private final TestEventRepository _repo;
    private final OrganizationService _os;
    private byte[] _fileContents;


    public DataHubUploaderService(TestEventRepository _repo, OrganizationService os) {
        this._repo = _repo;
        this._os = os;
    }


    private void _createTestEventCSV(String lastEndCreateOn) throws IOException {

        List<TestEvent> events = _repo.fetchPastResultsForOrganizationByDate(_os.getCurrentOrganization(),
                lastEndCreateOn);
        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader();
        this._fileContents = mapper.writer(schema).writeValueAsString(eventsToExport).getBytes();
    }

    private String _uploadWordDocument(final String apiKey, final String filename) {
        ByteArrayResource contentsAsResource = new ByteArrayResource(this._fileContents) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> map = new LinkedMultiValueMap<String, Object>();
        map.add("file", contentsAsResource);
        map.add("name", filename);
        map.add("filename", filename);

        RestTemplate restTemplate = new RestTemplateBuilder(rt -> rt.getInterceptors().add((request, body, execution) -> {
            HttpHeaders header = request.getHeaders();
            header.add("client", "simple_report");
            header.add("x-functions-key", apiKey);
            return execution.execute(request, body);
        })).build();

        String result = restTemplate.postForObject(DUMMY_UPLOAD_URL, map, String.class);
        LOG.info("Post file result '{}'", result);
        return result;
    }

    @Transactional(readOnly = false)
    public String uploadTestEventCVSToDataHub(final String lastEndCreateOn, final String apiKey) {
        try {
            this._createTestEventCSV(lastEndCreateOn);
            this._uploadWordDocument( apiKey, "test");
            return "something interesting";
        } catch (IOException err) {
            return err.toString();
        }
    }
}
