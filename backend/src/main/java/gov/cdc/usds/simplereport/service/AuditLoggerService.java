package gov.cdc.usds.simplereport.service;

import ch.qos.logback.classic.Logger;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AuditLoggerService {
  private final ObjectMapper objectMapper;
  private final Logger jsonLogger;

  public AuditLoggerService(ObjectMapper objectMapper, Logger jsonLogger) {
    this.objectMapper = objectMapper;
    this.jsonLogger = jsonLogger;
  }

  public void logEvent(ConsoleApiAuditEvent apiAuditEvent) {
    try {
      String auditJson = objectMapper.writeValueAsString(apiAuditEvent);
      jsonLogger.info(auditJson);
    } catch (JsonProcessingException e) {
      log.info("error transforming to json {}", e.toString());
    }
  }
}
