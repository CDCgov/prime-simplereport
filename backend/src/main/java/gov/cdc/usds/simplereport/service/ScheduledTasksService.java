package gov.cdc.usds.simplereport.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class ScheduledTasksService {
    private static final Logger LOG = LoggerFactory.getLogger(ScheduledTasksService.class);
    private static final int FIXED_DELAY_MS = 1000*60*5;  // fixed period in milliseconds after last task ends

    @Scheduled(fixedDelay = FIXED_DELAY_MS)
    public void reportCurrentTime() {
        LOG.info("Fixed puts a delay between tasks, so they can run as long as needed without overlapping.\n" +
                " The time is now {}", new SimpleDateFormat("HH:mm:ss").format(new Date()));
    }

    // see https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html
    @Scheduled(cron = "0 0 10 * * *", zone="America/Los_Angeles") // 22 "America/New_York"
    public void runDaily() {
        LOG.info("Daily run. The time is now {}", new SimpleDateFormat("HH:mm:ss").format(new Date()));
    }

    @Scheduled(cron = "*/60 * * * * *", zone="America/Los_Angeles") // 22 "America/New_York"
    public void quickCronTest() {
        LOG.info("quickCronTest. The time is now {}", new SimpleDateFormat("HH:mm:ss").format(new Date()));
    }
}
