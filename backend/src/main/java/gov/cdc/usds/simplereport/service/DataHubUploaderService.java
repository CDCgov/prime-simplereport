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
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.persistence.NoResultException;
import java.io.IOException;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DataHubUploaderService {
    static final String DUMMY_UPLOAD_URL = "https://prime-data-hub-test.azurefd.net/api/reports";
    private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);

    private final TestEventRepository _repo;
    private byte[] _fileContents;

    public DataHubUploaderService(TestEventRepository _repo) {
        this._repo = _repo;
    }

    private void _createTestEventCSV(String lastEndCreateOn) throws IOException, DateTimeParseException, NoResultException {
        List<TestEvent> events = _repo.findAllByCreatedAtInstant(Instant.parse(lastEndCreateOn));
        if (events.size() == 0) {
            throw new NoResultException();
        }
        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));
        CsvMapper mapper = new CsvMapper();
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader();
        this._fileContents = mapper.writer(schema).writeValueAsString(eventsToExport).getBytes();
    }

    private String _uploadCSVDocument(final String apiKey, final String filename) throws IOException, RestClientException {
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
            header.add("content-type", "text/csv");
            return execution.execute(request, body);
        })).build();

        String result = restTemplate.postForObject(DUMMY_UPLOAD_URL, map, String.class);
        LOG.info("Post file result '{}'", result);

        return result;
    }

    @Transactional(readOnly = false)
    public String uploadTestEventCVSToDataHub(final String apiKey, final String lastEndCreateOn) {
        String result;
        try {
            this._createTestEventCSV(lastEndCreateOn);
            return this._uploadCSVDocument( apiKey, "test");
        } catch (DateTimeParseException err) {
            err.printStackTrace();
            return "Err: create time not processed should be like '2020-01-01T16:13:15.448000Z'";
        } catch (NoResultException err) {
          return "Err: no records matched after startupdateby='" + lastEndCreateOn + "'";
        } catch (IOException err) {
            return err.toString();
        }
    }
}
