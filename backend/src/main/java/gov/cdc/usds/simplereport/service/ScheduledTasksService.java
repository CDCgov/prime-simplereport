package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ScheduledFuture;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.task.TaskSchedulerBuilder;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

@Service
public class ScheduledTasksService {

  private static final Logger LOG = LoggerFactory.getLogger(ScheduledTasksService.class);

  private final TaskScheduler _scheduler;
  private final DataHubUploaderService _dataHubUploaderService;

  public ScheduledTasksService(
      DataHubUploaderService dataHubUploaderService, TaskSchedulerBuilder schedulerBuilder) {
    _dataHubUploaderService = dataHubUploaderService;
    _scheduler = schedulerBuilder.build();
  }

  public Map<String, ScheduledFuture<?>> scheduleUploads(DataHubConfig config) {
    Map<String, ScheduledFuture<?>> futures = new HashMap<>();
    TimeZone tz = config.getUploadTimezone();
    for (String cron : config.getUploadSchedule()) {
      LOG.info(
          "Scheduling data hub upload to run on cron schedule '{}' in time zone {}",
          cron,
          tz.getID());
      Trigger cronTrigger = new CronTrigger(cron, tz);
      futures.put(
          cron, _scheduler.schedule(_dataHubUploaderService::dataHubUploaderTask, cronTrigger));
    }
    return futures;
  }
}
