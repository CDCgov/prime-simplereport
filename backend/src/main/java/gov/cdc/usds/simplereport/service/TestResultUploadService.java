package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.BulkTestResultUpload;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.repository.UploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestResultUploadService {
  private final UploadRepository _repo;
  private final DataHubClient _client;
  private final OrganizationService _orgService;

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public String processResultCSV(InputStream csvStream) throws IllegalGraphqlArgumentException {

    Organization org = _orgService.getCurrentOrganization();
    try {
      UploadResponse response = _client.uploadCSV(csvStream.readAllBytes());

      JSONArray warnings = new JSONArray(response.warnings);
      JSONArray errors = new JSONArray(response.errors);
      _repo.save(
          new BulkTestResultUpload(
              response.id,
              response.overallStatus,
              response.reportItemCount,
              org,
              null,
              warnings.toString(),
              errors.toString()) {});
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    return "this area under construction";
  }

  public List<BulkTestResultUpload> getUploadSubmissions(
      Date startDate, Date endDate, int pageNumber, int pageSize) {
    Organization org = _orgService.getCurrentOrganization();

    if (pageNumber < 0) {
      pageNumber = TestOrderService.DEFAULT_PAGINATION_PAGEOFFSET;
    }
    if (pageSize < 1) {
      pageSize = TestOrderService.DEFAULT_PAGINATION_PAGESIZE;
    }
    PageRequest pageRequest = PageRequest.of(pageNumber, pageSize);

    if (startDate == null && endDate == null) {
      return _repo.findAllByOrganizationOrderByCreatedAtDesc(org, pageRequest);
    }

    if (endDate == null) {
      return _repo.findAllByOrganizationAndCreatedAtIsAfterOrderByCreatedAtDesc(
          org, startDate, pageRequest);
    }

    if (startDate == null) {
      return _repo.findAllByOrganizationAndCreatedAtIsBeforeOrderByCreatedAtDesc(
          org, endDate, pageRequest);
    }

    return _repo.findAllByOrganizationAndCreatedAtIsAfterAndCreatedAtIsBeforeOrderByCreatedAtDesc(
        org, startDate, endDate, pageRequest);
  }

  public int getUploadSubmissionsCount() {
    Organization org = _orgService.getCurrentOrganization();
    return _repo.countAllByOrganization(org);
  }
}
