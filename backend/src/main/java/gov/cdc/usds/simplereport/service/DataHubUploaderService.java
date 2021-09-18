package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.db.model.DataHubUpload;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.DataHubUploadStatus;
import gov.cdc.usds.simplereport.db.repository.DataHubUploadRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.TimeZone;
import java.util.UUID;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@Transactional(readOnly = true)
public class DataHubUploaderService {
  private static final Logger LOG = LoggerFactory.getLogger(DataHubUploaderService.class);

  private final DataHubConfig _config;
  private final TestEventRepository _testReportEventsRepo;
  private final DataHubUploadRepository _dataHubUploadRepo;
  private final UploadTrackingService _trackingService;
  private final SlackMessageService _slack;
  private final TestEventReportingService _testEventReportingService;

  private String _fileContents;
  private Date _nextTimestamp;
  private String _warnMessage;
  private String _resultJson;
  private int _rowCount;

  public DataHubUploaderService(
      DataHubConfig config,
      TestEventRepository testReportEventsRepo,
      DataHubUploadRepository dataHubUploadRepo,
      UploadTrackingService trackingService,
      SlackMessageService slack,
      TestEventReportingService testEventReportingService) {
    _config = config;
    _testReportEventsRepo = testReportEventsRepo;
    _trackingService = trackingService;
    _dataHubUploadRepo = dataHubUploadRepo;
    _slack = slack;
    _testEventReportingService = testEventReportingService;

    LOG.info("Datahub scheduling uploader enable state: {}", config.getUploadEnabled());

    // sanity checks that run at startup since they are used by scheduler and may not fail until
    // 4am.
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
    // this needs a refactor. This is ONLY here until we can get rid of running the schedule via a
    // webaddress
    _nextTimestamp = null;
    _warnMessage = "";
    _resultJson = "{}";
    _rowCount = 0;
  }

  // todo: move to these somewhere common
  private static String dateToUTCString(Date d) {
    if (d == null) {
      return "null"; // Note: is a temp workaround. Logging may pass NULL for uninitialized fields
    }
    SimpleDateFormat simpleDateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    simpleDateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
    return simpleDateFormat.format(d);
  }

  // we put this in a function because the query can return null and it abstracts it out
  private Date getLatestRecordedTimestamp() {
    DataHubUpload lastUpload =
        _dataHubUploadRepo.findDistinctTopByJobStatusOrderByLatestRecordedTimestampDesc(
            DataHubUploadStatus.SUCCESS);
    if (lastUpload != null) {
      return lastUpload.getLatestRecordedTimestamp();
    } else {
      // This should only happen when database is empty, throw?
      LOG.error(
          "No default timestamp, will return everything. Use url to set initial lastEndCreateOn.");
      return null;
    }
  }

  private List<TestEvent> createTestEventCSV(Date earliestCreatedAt, Date latestCreateOn)
      throws IOException, DateTimeParseException {
    return createTestEventCSV(
        _testReportEventsRepo.queryMatchAllBetweenDates(
            earliestCreatedAt, latestCreateOn, PageRequest.of(0, _config.getMaxCsvRows())));
  }

  private List<TestEvent> createTestEventCSV(List<TestEvent> events) throws IOException {
    if (events.size() == 0) {
      return events;
    } else if (events.size() == _config.getMaxCsvRows()) {
      this._warnMessage += "More rows were found than can be uploaded in a single batch.";
    }

    this._rowCount = events.size();
    // timestamp of last matched entry, used for the next query.
    this._nextTimestamp = events.get(_rowCount - 1).getCreatedAt();

    this.setFileContents(events);

    return events;
  }

  private void setFileContents(List<TestEvent> events) throws IOException {
    List<TestEventExport> eventsToExport = new ArrayList<>();
    events.forEach(e -> eventsToExport.add(new TestEventExport(e)));
    CsvMapper mapper = new CsvMapper();
    mapper
        .enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
        .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
        .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);
    // You would think `withNullValue` and `ALWAYS_QUOTE_EMPTY_STRINGS` would be enough, but it's
    // not.
    // we have to return `""` withNullValue to keep `,,,` out of the the csv
    CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");
    this._fileContents = mapper.writer(schema).writeValueAsString(eventsToExport);
  }

  private void uploadCSVDocument(String apiKey) throws RestClientException {
    ByteArrayResource contentsAsResource =
        new ByteArrayResource(this._fileContents.getBytes(StandardCharsets.UTF_8));

    RestTemplate restTemplate =
        new RestTemplateBuilder(
                rt ->
                    rt.getInterceptors()
                        .add(
                            (request, body, execution) -> {
                              HttpHeaders headers = request.getHeaders();
                              headers.setContentType(new MediaType("text", "csv"));
                              headers.add("x-functions-key", apiKey);
                              headers.add("client", "simple_report");
                              headers.add("x-api-version", TestEventExport.CSV_API_VERSION);
                              return execution.execute(request, body);
                            }))
            .build();

    URI url = UriComponentsBuilder.fromUriString(_config.getUploadUrl()).build().toUri();

    _resultJson = restTemplate.postForObject(url, contentsAsResource, String.class);
  }

  public void oneOffUploaderTask(List<UUID> testEventIds) {
    uploaderTask(
        () -> {
          try {
            return createTestEventCSV(_testReportEventsRepo.findAllByInternalIdIn(testEventIds));
          } catch (IOException err) {
            throw new UnexpectedIOException(err);
          }
        },
        false);
  }

  public void dataHubUploaderTask() {
    uploaderTask(
        () -> {
          // end range is back 1 minute, to avoid complications involving open
          // transactions
          Timestamp dateOneMinAgo = Timestamp.from(Instant.now().minus(1, ChronoUnit.MINUTES));
          try {
            return createTestEventCSV(dateOneMinAgo, getLatestRecordedTimestamp());
          } catch (IOException err) {
            throw new UnexpectedIOException(err);
          }
        });
  }

  /**
   * The logic in setFileContents uses Jackson's writeAsString, which is declared to throw
   * IOException. Its internal commentary describes it as basically impossible for it to reach that
   * code branch. In order to refactor this lambda as cleanly as possible, I'm wrapping it in a
   * RuntimeException, so we don't have to declare anything different
   */
  private static class UnexpectedIOException extends RuntimeException {
    UnexpectedIOException(Exception e) {
      super(e);
    }
  }

  private void uploaderTask(Supplier<List<TestEvent>> testEventSupplier) {
    uploaderTask(testEventSupplier, true);
  }

  private void uploaderTask(Supplier<List<TestEvent>> testEventSupplier, boolean withTracking) {
    // sanity check everything is configured correctly (dev likely will not be)
    if (!_config.getUploadEnabled()) {
      LOG.warn(
          "DataHubUploaderTask not running because simple-report.data-hub.uploadEnabled is false");
      return;
    }

    if (_dataHubUploadRepo
        .tryUploadLock()) { // take the advisory lock for this process. auto released after
      // transaction
      LOG.info("Data hub upload lock obtained: commencing upload processing.");
    } else {
      LOG.info("Data hub upload locked out by mutex: aborting");
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
      _slack.sendSlackChannelMessage("DataHubUploader not run", msgs, true);
      return;
    }

    // The start date is the last end date. Can be null for empty database.
    Date lastTimestamp = getLatestRecordedTimestamp();
    if (lastTimestamp == null) {
      // this happens if EVERYTHING in the db would be matched.
      LOG.error("No earliest_recorded_timestamp found. EVERYTHING would be matched and sent");
      return;
    }

    Optional<DataHubUpload> tracking =
        withTracking ? Optional.of(_trackingService.startUpload(lastTimestamp)) : Optional.empty();
    try {
      var eventsReported = testEventSupplier.get();
      tracking.ifPresent(
          upload -> _trackingService.markRowCount(upload, _rowCount, _nextTimestamp));

      if (_rowCount > 0) {
        this.uploadCSVDocument(_config.getApiKey());
      } else {
        LOG.info("No new tests found since previous successful data hub upload.");
      }

      // todo: parse json run sanity checks like total records processed matches what we sent.
      tracking.ifPresent(
          upload -> _trackingService.markSucceeded(upload, _resultJson, _warnMessage));

      // Clear the reported items from the testing queue
      _testEventReportingService.markTestEventsAsReported(new HashSet<>(eventsReported));
    } catch (RestClientException | UnexpectedIOException err) {
      tracking.ifPresent(upload -> _trackingService.markFailed(upload, _resultJson, err));
    }

    tracking.ifPresent(
        upload -> {
          if (_rowCount > 0) {
            // Build and send message to slackChannel
            ArrayList<String> message = new ArrayList<>();
            message.add("Result: ```" + upload.getJobStatus() + "``` ");
            message.add("RecordsProcessed: " + upload.getRecordsProcessed());
            message.add(
                "EarliestTimestamp: " + dateToUTCString(upload.getEarliestRecordedTimestamp()));
            message.add("LatestTimestamp: " + dateToUTCString(upload.getLatestRecordedTimestamp()));
            message.add("ErrorMessage: " + upload.getErrorMessage());
            message.add("setResponseData: ");
            message.add("> ``` " + upload.getResponseData() + " ```");
            _slack.sendSlackChannelMessage("DataHubUpload result", message, false);
          }
        });

    // should this sleep for some period of time? If no rows match it may be really fast
    // and other server instances not overlap and get blocked by tryUploadLock() otherwise.
  }
}
