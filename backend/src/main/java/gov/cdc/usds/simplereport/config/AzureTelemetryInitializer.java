package gov.cdc.usds.simplereport.config;

import com.microsoft.applicationinsights.extensibility.TelemetryInitializer;
import com.microsoft.applicationinsights.telemetry.RequestTelemetry;
import gov.cdc.usds.simplereport.api.CurrentUIVersionContextHolder;

import com.microsoft.applicationinsights.telemetry.Telemetry;

public class AzureTelemetryInitializer implements TelemetryInitializer {
    private final CurrentUIVersionContextHolder _currentUIVersionContextHolder;

    AzureTelemetryInitializer(CurrentUIVersionContextHolder currentUIVersionContextHolder) {
      _currentUIVersionContextHolder = currentUIVersionContextHolder;
    }

    public void initialize(Telemetry telemetry) {
        RequestTelemetry requestTelemetry = (RequestTelemetry) telemetry;

        if (requestTelemetry == null) {
            return;
        }

        requestTelemetry.getProperties().put("UI Version", _currentUIVersionContextHolder.getUiShaFromHeaders());
    }
}
