package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import java.util.HashMap;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.ScheduledFuture;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.task.TaskSchedulerBuilder;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ScheduledTasksService {

  private final TaskScheduler _scheduler;
  private final DataHubUploaderService _dataHubUploaderService;
  private final ReminderService _reminderService;

  public ScheduledTasksService(
      DataHubUploaderService dataHubUploaderService,
      ReminderService reminderService,
      TaskSchedulerBuilder schedulerBuilder) {
    _dataHubUploaderService = dataHubUploaderService;
    _reminderService = reminderService;
    ThreadPoolTaskScheduler scheduler = schedulerBuilder.build();
    scheduler.initialize();
    _scheduler = scheduler;
  }

  public Map<String, ScheduledFuture<?>> scheduleUploads(DataHubConfig config) {
    Map<String, ScheduledFuture<?>> futures = new HashMap<>();
    TimeZone tz = config.getUploadTimezone();
    for (String cron : config.getUploadSchedule()) {
      log.info(
          "Scheduling data hub upload to run on cron schedule '{}' in time zone {}",
          cron,
          tz.getID());
      Trigger cronTrigger = new CronTrigger(cron, tz);
      futures.put(
          cron, _scheduler.schedule(_dataHubUploaderService::dataHubUploaderTask, cronTrigger));
    }
    return futures;
  }

  public void scheduleAccountReminderEmails(String cronScheduleDefinition, String tzString) {
    TimeZone tz = TimeZone.getTimeZone(tzString);
    log.info(
        "Scheduling account reminder emails to run on cron schedule '{}' in time zone {}",
        cronScheduleDefinition,
        tz.getID());
    Trigger cronTrigger = new CronTrigger(cronScheduleDefinition, tz);
    _scheduler.schedule(_reminderService::sendAccountReminderEmails, cronTrigger);
  }
}
