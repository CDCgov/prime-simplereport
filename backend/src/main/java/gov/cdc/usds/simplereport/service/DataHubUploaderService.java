package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.RaceArrayConverter;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import net.minidev.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import javax.persistence.NoResultException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class DataHubUploaderService {
    @Value("${simple-report.data-hub.uploadurl}")
    private String DATAHUB_UPLOAD_URL;
    static final int MAX_ROWS_ALLOWED_PER_BATCH = 999;
    static final String API_VERSION = "2";
    private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);

    private final TestEventRepository _repo;
    private String _fileContents;
    private String _nextTimestamp;
    private String _warnMessage;
    private String _uploadResultId;
    private int _rowCount;

    public DataHubUploaderService(TestEventRepository _repo) {
        this._repo = _repo;
        this._nextTimestamp = "";
        this._warnMessage = "";
        this._uploadResultId = "";
        this._rowCount = 0;
    }

    private void _createTestEventCSV(String lastEndCreateOn) throws IOException, DateTimeParseException, NoResultException {
        if (lastEndCreateOn.length() == 0) {
            // testing only, just query everything
            lastEndCreateOn = "2020-01-01T00:00:00.00Z";
            LOG.info("Empty startupdateby so using 2020-01-01");
        }
        List<TestEvent> events = _repo.findAllByCreatedAtInstant(lastEndCreateOn);
        if (events.size() == 0) {
            throw new NoResultException();
        } else if (events.size() >= MAX_ROWS_ALLOWED_PER_BATCH) {
            this._warnMessage += "More rows were found than can be uploaded in a single batch. Needs to be more than once.";
        }

        // timestamp of highest matched entry, used for the next query. This is ridiculous, it cannot be right.
        this._nextTimestamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS").format(events.get(0).getCreatedAt()).toString();
        this._rowCount = events.size();

        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));

        CsvMapper mapper = new CsvMapper();
        mapper.enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);
        // You would think `withNullValue` and `ALWAYS_QUOTE_EMPTY_STRINGS` would be enough, but you'd be wrong,
        // we have to return `""` withNullValue to not put `,,,` in the csv
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");
        this._fileContents = mapper.writer(schema).writeValueAsString(eventsToExport);
    }

    private void _uploadCSVDocument(final String apiKey) throws IOException, RestClientException {
        ByteArrayResource contentsAsResource = new ByteArrayResource(this._fileContents.getBytes(StandardCharsets.UTF_8));

        RestTemplate restTemplate = new RestTemplateBuilder(rt -> rt.getInterceptors().add((request, body, execution) -> {
            HttpHeaders headers = request.getHeaders();
            headers.setContentType(new MediaType("text", "csv"));
            headers.add("x-functions-key", apiKey);
            headers.add("client", "simple_report");
            headers.add("x-api-version", API_VERSION);
            return execution.execute(request, body);
        })).build();

        _uploadResultId = restTemplate.postForObject(DATAHUB_UPLOAD_URL, contentsAsResource, String.class);
    }

    public String creatTestCVSForDataHub(String lastEndCreateOn) {
        try {
            this._createTestEventCSV(lastEndCreateOn);
            return this._fileContents;
        } catch (IOException err) {
            return err.toString();
        } catch (NoResultException err) {
            return "No matching results for the given startupdateby param";
        }
    }

    // todo: Think through this transaction. In theory, this operation will have it's own table to
    // track and log uploads.
    // There is also the risk of the top action running multiple times concurrently.
    // ultimately, it would be nice if each row had an ID that could be dedupped on the server.
    @Transactional(readOnly = true)
    public String uploadTestEventCVSToDataHub(final String apiKey, String lastEndCreateOn) {
        try {
            this._createTestEventCSV(lastEndCreateOn);
            this._uploadCSVDocument(apiKey);

            JSONObject resultJson = new JSONObject();
            resultJson.put("result", "ok");
            resultJson.put("lastTimestamp", this._nextTimestamp);
            resultJson.put("rowsSent", this._rowCount);
            resultJson.put("uploadResultId", this._uploadResultId);
            resultJson.put("warnMessage", this._warnMessage);
            return resultJson.toJSONString();

        } catch (RestClientException err) {
            return "Err: uploading csv to data-hub failed. error='" + err.toString() + "'";
        } catch (IOException err) {
            return err.toString();
        } catch (NoResultException err) {
            return "No matching results for the given startupdateby param";
        }
    }
}
