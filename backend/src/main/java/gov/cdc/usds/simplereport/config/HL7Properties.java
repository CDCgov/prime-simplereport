package gov.cdc.usds.simplereport.config;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * These values were assigned from APHL for use in MSH-3 Sending Application. <br>
 * <br>
 * As of 11/4/2025, APHL stated we should continue to use the existing CDC OID for other HL7 fields
 * like ORC-3.3 where SimpleReport is identified as the assigning authority.
 *
 * @see gov.cdc.usds.simplereport.api.converter.HL7Constants
 */
@Component
@ConfigurationProperties(prefix = "simple-report.hl7")
@Getter
@Setter
@RequiredArgsConstructor
@Slf4j
public class HL7Properties {
  public String sendingApplicationNamespace;
  public String sendingApplicationOID;
}
