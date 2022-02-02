package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.service.AuditService;
import java.util.List;
import org.hibernate.validator.constraints.Range;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.context.annotation.Profile;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Endpoint(id = "auditlog")
@Component
@Profile(BeanProfiles.SERVER_DEBUG)
@Validated
public class AuditDebuggingEndpoint {

  @Autowired private AuditService _service;

  @ReadOperation(produces = "application/json")
  public List<ApiAuditEvent> getLatest(
      @Nullable @Range(min = 1, max = AuditService.MAX_EVENT_FETCH) Integer count) {
    if (count == null) {
      count = 1;
    }
    return _service.getLastEvents(count);
  }
}
