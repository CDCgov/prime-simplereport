package gov.cdc.usds.simplereport.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;


@Service
public class ScheduledTasksService {
    private static final Logger LOG = LoggerFactory.getLogger(ScheduledTasksService.class);
    private final DataHubUploaderService _dataHubUploaderService;

    ScheduledTasksService(DataHubUploaderService dataHubUploaderService) {
        _dataHubUploaderService = dataHubUploaderService;
    }

// Example of how to run periodically, save for future use (and testing)
//    private static final int FIXED_DELAY_MS = 1000*60*5;  // fixed period in milliseconds after last task ends
//
//    @Scheduled(fixedDelay = FIXED_DELAY_MS)
//    public void runOnDelay() {
//        LOG.info("Delay periodic run: Start");
//        _dataHubUploaderService.DataHubUploaderTask();
//        LOG.info("Delay periodic run: Finish");
//    }

    // see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html
    // Try to pick times where most of the US is on the same calendar date.
    @Scheduled(cron = "0 0 4 * * *", zone="America/New_York")
    public void runDaily() {
        LOG.info("Daily Cron: Start");
        _dataHubUploaderService.DataHubUploaderTask();
        LOG.info("Daily Cron: Finish");
    }
}
