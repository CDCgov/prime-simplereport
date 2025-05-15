package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataExportService {
  @AuthorizationConfiguration.RequirePermissionEditFacility
  public String exportData(String facilityId) {
    return "foo,bar\n1,2";
  }
}
