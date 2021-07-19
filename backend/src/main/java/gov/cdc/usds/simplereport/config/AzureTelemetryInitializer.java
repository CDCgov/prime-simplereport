package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;

import com.microsoft.applicationinsights.telemetry.Telemetry;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AzureTelemetryInitializer implements TelemetryInitializer {
    private final CurrentUIVersionContextHolder _currentUIVersionContextHolder;
    private static final Logger LOG = LoggerFactory.getLogger(AzureTelemetryInitializer.class);

    AzureTelemetryInitializer(CurrentUIVersionContextHolder currentUIVersionContextHolder) {
      _currentUIVersionContextHolder = currentUIVersionContextHolder;
    }

    public void initialize(Telemetry telemetry) {
        LOG.info("Initializing Azure telemetry client...");
        RequestTelemetry requestTelemetry = (RequestTelemetry) telemetry;

        if (requestTelemetry == null) {
            LOG.info("Request telemetry instance not found. Exiting telemetry client initialization.");
            return;
        }

        requestTelemetry.getProperties().put("UI Version", _currentUIVersionContextHolder.getUiShaFromHeaders());
        requestTelemetry.getProperties().put("HELLO", "WORLD");

        LOG.info("Azure telemetry client initialized.");
    }
}
