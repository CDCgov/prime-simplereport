package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import gov.cdc.usds.simplereport.db.repository.DataHubUploadRespository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import javax.persistence.NoResultException;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

@Service
@Transactional
public class DataHubUploaderService {
    private static final String CSV_API_VERSION = "3";
    private static final Logger LOG = LoggerFactory.getLogger(DataHubUploaderService.class);

    private final DataHubConfig _config;
    private final TestEventRepository _testReportEventsRepo;
    private final DataHubUploadRespository _dataHubUploadRepo;

    private String _fileContents;
    private String _nextTimestamp;
    private String _warnMessage;
    private String _resultJson;
    private int _rowCount;

    public DataHubUploaderService(DataHubConfig config,
                                  TestEventRepository testReportEventsRepo,
                                  DataHubUploadRespository dataHubUploadRepo) {
        _config = config;
        _testReportEventsRepo = testReportEventsRepo;
        _dataHubUploadRepo = dataHubUploadRepo;

        LOG.info("Datahub scheduling uploader enable state: {}", config.getUploadEnabled());

        // sanity checks that run at startup since they are used by scheduler and may not fail until 4am.
        // maybe these should throw?
        if (config.getApiKey().startsWith("MISSING")) {
            LOG.warn("DataHub API key is not configured.");
        }
        if (!config.getUploadUrl().startsWith("https://")) {
            LOG.warn("DataHub upload URL is not configured.");
        }
        if (!config.getSlackNotifyWebhookUrl().startsWith("https://")) {
            LOG.warn("DataHub Slack webhook URL is not configured.");
        }
    }

    private void init() {
        // because we are a service these need to be reset each time through.
        // this needs a refactor. This is ONLY here until we can get rid of running the schedule via a webaddress
        _nextTimestamp = "";
        _warnMessage = "";
        _resultJson = "";
        _rowCount = 0;
    }

    // todo: move to these somewhere common
    private static String dateToUTCString(Date d) {
        if (d == null) {
            return "null";   // Note: is a temp workaround. Logging may pass NULL for uninitialized fields
        }
        SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        simpleDateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
        return simpleDateFormat.format(d);
    }

    private static Date utcStringToDate(String s) {
        return Date.from(Instant.parse(s));
    }

    private void sendSlackChannelMessage(String titleMsg, List<String> markupMsgs, Boolean separateMsgs) {
        // NOTE: logging this is overkill. Putting it hear until we fully trust Slack messaging is working.
        String markupMsgsForLog = String.join(" ", markupMsgs);
        if (!_config.getSlackNotifyWebhookUrl().startsWith("https://hooks.slack.com/")) {
            LOG.error("SlackChannelNotConfigured. Message not sent Title: '{}' Body: {}", titleMsg, markupMsgsForLog);
            return;
        } else {
            // log the result since slack may be down.
            LOG.info("slackMessage Title: '{}'  Body: '{}'", titleMsg, markupMsgsForLog);
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // json (escaping)
            // see https://api.slack.com/messaging/webhooks
            // see https://app.slack.com/block-kit-builder/
            JSONArray blocks = new JSONArray();
            blocks.put(Map.of(
                    "type", "header",
                    "text", Map.of(
                            "type", "plain_text",
                            "text", titleMsg)
            ));
            markupMsgs.forEach(msg -> {
                blocks.put(Map.of(
                        "type", "section",
                        "text", Map.of(
                                "type", "mrkdwn",
                                "text", msg)));
                if (Boolean.TRUE.equals(separateMsgs)) {
                    blocks.put(Map.of("type", "divider"));
                }
            });
            String requestJson = new JSONObject(Map.of("blocks", blocks)).toString();

            HttpEntity<String> entity = new HttpEntity<>(requestJson, headers);
            restTemplate.put(_config.getSlackNotifyWebhookUrl(), entity);
        } catch (RestClientException | JSONException err) {
            LOG.error(err.toString());
        }
    }

    // we put this in a function because the query can return null and it abstracts it out
    private Date getLatestRecordedTimestamp() {
        DataHubUpload lastUpload = _dataHubUploadRepo.findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(DataHubUploadStatus.SUCCESS);
        if (lastUpload != null) {
            return lastUpload.getLatestRecordedTimestamp();
        } else {
            // This should only happen when database is empty, throw?
            LOG.error("No default timestamp, will return everything. Use url to set initial lastEndCreateOn.");
            return null;
        }
    }

    // backwards compatible while refactoring
    private void createTestEventCSV(String lastEndCreateOn) throws IOException, DateTimeParseException, NoResultException {
        final Date DATE_1MIN_AGO = new Date(System.currentTimeMillis() - TimeUnit.MINUTES.toMillis(1));
        if (lastEndCreateOn.length() == 0) {
            // This should only happen when database is empty
            LOG.error("No default timestamp, will return everything. Use url to set initial lastEndCreateOn.");
            throw new NoResultException("No default lastEndCreateOn, everything would match.");
        }
        createTestEventCSV(utcStringToDate(lastEndCreateOn), DATE_1MIN_AGO);
    }

    private void createTestEventCSV(Date earlistCreatedAt, Date latestCreateOn)
            throws IOException, DateTimeParseException, NoResultException {
        List<TestEvent> events = _testReportEventsRepo.queryMatchAllBetweenDates(earlistCreatedAt, latestCreateOn);
        if (events.size() == 0) {
            throw new NoResultException();
        } else if (events.size() >= _config.getMaxCsvRows()) {
            this._warnMessage += "More rows were found than can be uploaded in a single batch. Needs to be more than once.";
        }

        // timestamp of highest matched entry, used for the next query.
        this._nextTimestamp = dateToUTCString(events.get(0).getCreatedAt());
        this._rowCount = events.size();

        List<TestEventExport> eventsToExport = new ArrayList<>();
        events.forEach(e -> eventsToExport.add(new TestEventExport(e)));

        CsvMapper mapper = new CsvMapper();
        mapper.enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
                .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);
        // You would think `withNullValue` and `ALWAYS_QUOTE_EMPTY_STRINGS` would be enough, but it's not.
        // we have to return `""` withNullValue to keep `,,,` out of the the csv
        CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");
        this._fileContents = mapper.writer(schema).writeValueAsString(eventsToExport);
    }

    private void uploadCSVDocument(String apiKey) throws RestClientException {
        ByteArrayResource contentsAsResource = new ByteArrayResource(this._fileContents.getBytes(StandardCharsets.UTF_8));

        RestTemplate restTemplate = new RestTemplateBuilder(rt -> rt.getInterceptors().add((request, body, execution) -> {
            HttpHeaders headers = request.getHeaders();
            headers.setContentType(new MediaType("text", "csv"));
            headers.add("x-functions-key", apiKey);
            headers.add("client", "simple_report");
            headers.add("x-api-version", CSV_API_VERSION);
            return execution.execute(request, body);
        })).build();

        URI url = UriComponentsBuilder.fromUriString(_config.getUploadUrl()).build().toUri();

        _resultJson = restTemplate.postForObject(url, contentsAsResource, String.class);
    }

    @AuthorizationConfiguration.RequirePermissionExportTestEvent
    public String createTestCSVForDataHub(String lastEndCreateOn) {
        try {
            this.createTestEventCSV(lastEndCreateOn);
            return this._fileContents;
        } catch (IOException err) {
            return err.toString();
        } catch (NoResultException err) {
            return "No matching results for the given time range";
        }
    }

    // There is also the risk of the top action running multiple times concurrently.
    // ultimately, it would be nice if each row had an ID that could be dedupped on the server.
    @Transactional
    @AuthorizationConfiguration.RequireGlobalAdminUser
    public Map<String, String> uploadTestEventCSVToDataHub(final String apiKey, String lastEndCreateOn) {
        try {
            this.init();
            // this will be null if there are no enties in the tracking table.
            // This is important for first-ever-run and then if the webpage is run again after the db is initialized
            Date lastTimestamp = getLatestRecordedTimestamp();
            if (lastTimestamp == null) {
                // database has no entries. FIRST EVER RUN.
                this.createTestEventCSV(lastEndCreateOn);
                this.uploadCSVDocument(apiKey);
                DataHubUpload newUpload = new DataHubUpload();
                newUpload.setJobStatus(DataHubUploadStatus.SUCCESS)
                        .setEarliestRecordedTimestamp(utcStringToDate(lastEndCreateOn))
                        .setLatestRecordedTimestamp(utcStringToDate(_nextTimestamp))
                        .setRecordsProcessed(_rowCount)
                        .setResponseData(_resultJson)
                        .setErrorMessage(_warnMessage);
                _dataHubUploadRepo.save(newUpload);
                LOG.info("Added {} to data_hub_upload table", newUpload.getInternalId());
            } else {
                // run the new code and ignore the lastEndCreateOn passed in.
                dataHubUploaderTask();
            }

            return Map.of(
                    "result", "ok",
                    "lastTimestamp", this._nextTimestamp,
                    "rowsSent", String.valueOf(this._rowCount),
                    "uploadResultId", this._resultJson,
                    "message", this._warnMessage);
        } catch (RestClientException err) {
            return Map.of("result", "error",
                    "message", "Err: uploading csv to data-hub failed. error='" + err.toString() + "'");
        } catch (IOException err) {
            return Map.of("result", "error",
                    "messsage", err.toString());
        } catch (NoResultException err) {
            return Map.of("result", "error",
                    "message", "No matching results for the given startupdateby param.  " + err.toString());
        }
    }

    public void dataHubUploaderTask() {
        // sanity check everything is configured correctly (dev likely will not be)
        if (!_config.getUploadEnabled()) {
            LOG.warn("DataHubUploaderTask not running because simple-report.data-hub.uploadEnabled is false");
            return;
        }

        this.init();
        ArrayList<String> msgs = new ArrayList<>();
        // sanity check the key was successful gotten from the data vault
        if (_config.getApiKey().startsWith("MISSING")) {
            msgs.add("> DataHub API key is not configured.");
        }
        if (!_config.getUploadUrl().startsWith("https://")) {
            msgs.add("> DataHub upload URL is not configured.");
        }
        if (!msgs.isEmpty()) {
            sendSlackChannelMessage("DataHubUploader not run", msgs, true);
            return;
        }

        DataHubUpload newUpload = new DataHubUpload();
        try {
            // The start date is the last end date. Can be null for empty database.
            Date lastTimestamp = getLatestRecordedTimestamp();
            if (lastTimestamp == null) {
                // this happens if EVERYTHING in the db would be matched.
                LOG.error("No earliest_recorded_timestamp found. EVERYTHING would be matched and sent");
                return;
            }
            newUpload.setEarliestRecordedTimestamp(lastTimestamp);
            _dataHubUploadRepo.save(newUpload);

            // end range is back 1 minute, this is to avoid selecting transactions that
            // may still be rolled back.
            final Timestamp dateOneMinAgo = Timestamp.from(Instant.now().minus(1, ChronoUnit.MINUTES));

            this.createTestEventCSV(lastTimestamp, dateOneMinAgo);
            _dataHubUploadRepo.save(newUpload
                    .setRecordsProcessed(_rowCount)
                    .setLatestRecordedTimestamp(utcStringToDate(_nextTimestamp)));

            this.uploadCSVDocument(_config.getApiKey());

            // todo: parse json run sanity checks like total records processed matches what we sent.

            _dataHubUploadRepo.save(newUpload
                    .setResponseData(_resultJson)
                    .setJobStatus(DataHubUploadStatus.SUCCESS));

        } catch (RestClientException | IOException err) {
            _dataHubUploadRepo.save(newUpload
                    .setResponseData(_resultJson)
                    .setJobStatus(DataHubUploadStatus.FAIL)
                    .setErrorMessage(err.toString()));
            LOG.error("DataHubUploaderService Error '{}'", err.toString());
        } catch (NoResultException err) {
            _dataHubUploadRepo.save(newUpload
                    .setJobStatus(DataHubUploadStatus.FAIL)
                    .setErrorMessage("No matching results for the given startupdateby param"));
            LOG.warn("DataHubUploaderService Warning NoMatchingRows latestRecordedTimestamp() '{}'", newUpload.getLatestRecordedTimestamp());
        }

        // Build and send message to slackChannel
        ArrayList<String> message = new ArrayList<>();
        message.add("Result: ```" + newUpload.getJobStatus() + "``` ");
        message.add("RecordsProcessed: " + newUpload.getRecordsProcessed());
        message.add("EarlistTimestamp: " + dateToUTCString(newUpload.getEarliestRecordedTimestamp()));
        message.add("LatestTimestamp: " + dateToUTCString(newUpload.getLatestRecordedTimestamp()));
        message.add("ErrorMessage: " + newUpload.getErrorMessage());
        message.add("setResponseData: ");
        message.add("> ``` " + newUpload.getResponseData() + " ```");
        sendSlackChannelMessage("DataHubUpload result", message, false);
    }
}
