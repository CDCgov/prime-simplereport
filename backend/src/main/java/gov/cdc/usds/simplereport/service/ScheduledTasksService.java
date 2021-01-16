package gov.cdc.usds.simplereport.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.ApplicationScope;

import javax.management.timer.Timer;


// ApplicationScope makes it a singleton
@Service
@ApplicationScope
public class ScheduledTasksService {
    private static final Logger LOG = LoggerFactory.getLogger(ScheduledTasksService.class);
    private final DataHubUploaderService _dataHubUploaderService;

    ScheduledTasksService(DataHubUploaderService dataHubUploaderService) {
        LOG.info("Scheduler initialized. Should ONLY HAPPEN ONCE.");
        _dataHubUploaderService = dataHubUploaderService;
    }

    // Example of how to run periodically, save for future use (and testing)
    private static final long FIXED_DELAY_MS = Timer.ONE_MINUTE * 120;

    @Scheduled(fixedDelay = FIXED_DELAY_MS, initialDelay = FIXED_DELAY_MS)
    public void runOnDelay() {
        LOG.info("Delay periodic run: Start");
        // _dataHubUploaderService.dataHubUploaderTask();
    }

    // see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html
    // Try to pick times where most of the US is on the same calendar date.
    @Scheduled(cron = "0 0 11 * * *", zone="America/New_York")
    public void runDaily() {
        LOG.info("Daily Cron: Start");
        _dataHubUploaderService.dataHubUploaderTask();
    }
}
