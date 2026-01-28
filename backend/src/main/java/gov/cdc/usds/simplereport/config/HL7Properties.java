package gov.cdc.usds.simplereport.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * These values were assigned from APHL for use in numerous places where we need SimpleReport's
 * namespace and OID.
 */
@ConfigurationProperties(prefix = "simple-report.hl7")
@Getter
@RequiredArgsConstructor
@Slf4j
public final class HL7Properties {
  private final String simpleReportNamespace;
  private final String simpleReportOid;
}
