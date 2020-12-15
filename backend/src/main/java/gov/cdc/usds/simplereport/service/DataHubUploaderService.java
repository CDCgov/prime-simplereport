package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
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
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.persistence.NoResultException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DataHubUploaderService {
    static final String DUMMY_UPLOAD_URL = "https://prime-data-hub-test.azurefd.net/api/reports";
    static final int MAX_ROWS_ALLOWED_PER_BATCH = 999;
    private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);

    private final TestEventRepository _repo;
    private byte[] _fileContents;
    private String _nextTimestamp;
    private String _warnMessage;

    public DataHubUploaderService(TestEventRepository _repo) {
        this._repo = _repo;
        this._nextTimestamp = "";
        this._warnMessage = "";
    }

    private void _createTestEventCSV(String lastEndCreateOn) throws IOException, DateTimeParseException, NoResultException {
        // Instant i = Instant.parse(lastEndCreateOn);
        List<TestEvent> events = _repo.findAllByCreatedAtInstant(lastEndCreateOn);
        if (events.size() == 0) {
            throw new NoResultException();
        } else if (events.size() >= MAX_ROWS_ALLOWED_PER_BATCH) {
            this._warnMessage += "More rows were found than can be uploaded in a single batch. Needs to be more than once.";
        }
        // timestamp of highest matched entry, used for the next query.
        this._nextTimestamp = events.get(0).getCreatedAt().toInstant().toString();

        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));

        CsvMapper mapper = new CsvMapper();
        mapper.enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);
        // You would think `withNullValue` and `ALWAYS_QUOTE_EMPTY_STRINGS` would be enough, but you'd be wrong,
        // we have to return `""` withNullValue to not put `,,,` in the csv
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");
        String csvcontent = mapper.writer(schema).writeValueAsString(eventsToExport);
        this._fileContents = csvcontent.getBytes(StandardCharsets.UTF_8);
    }

    private String _uploadCSVDocument(final String apiKey, final String filename) throws IOException, RestClientException {
        ByteArrayResource contentsAsResource = new ByteArrayResource(this._fileContents) {
            @Override
            public String getFilename() {
                return filename;
            }
        };

        MultiValueMap<String, Object> map = new LinkedMultiValueMap<String, Object>();
        map.add("name", filename);
        map.add("filename", filename);
        map.add("file", contentsAsResource);

        RestTemplate restTemplate = new RestTemplateBuilder(rt -> rt.getInterceptors().add((request, body, execution) -> {
            HttpHeaders headers = request.getHeaders();
            headers.setContentType(new MediaType("text","csv"));
            headers.add("x-functions-key", apiKey);
            headers.add("client", "simple_report");
            return execution.execute(request, body);
        })).build();

        String result = restTemplate.postForObject(DUMMY_UPLOAD_URL, map, String.class);
        LOG.info("Post file result '{}'", result);

        return result;
    }

    @Transactional(readOnly = false)
    public String uploadTestEventCVSToDataHub(final String apiKey, String lastEndCreateOn) {
        String result;
        try {
            if (lastEndCreateOn.length() == 0) {
                // testing only, just query everything
                lastEndCreateOn = "2020-01-01T00:00:00.00Z";
                LOG.info("Empty startupdateby so using 2020-01-01");
            }
            this._createTestEventCSV(lastEndCreateOn);
            result = this._uploadCSVDocument( apiKey, "test.csv");
            // todo: formulate the result here.
            return this._nextTimestamp;
        } catch (RestClientException err) {
            return "Err: uploading csv to data-hub failed. error='" + err.toString() + "'";
        } catch (IOException err) {
            return err.toString();
        } catch (Exception err) {
            LOG.error(err.toString());
            return "Err: no records matched after startupdateby='" + lastEndCreateOn + "'";
        }
    }
}
