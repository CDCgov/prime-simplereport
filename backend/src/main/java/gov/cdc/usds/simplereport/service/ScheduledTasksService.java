package gov.cdc.usds.simplereport.service;

import java.util.TimeZone;
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
  private final ReminderService _reminderService;

  public ScheduledTasksService(
      ReminderService reminderService, TaskSchedulerBuilder schedulerBuilder) {
    _reminderService = reminderService;
    ThreadPoolTaskScheduler scheduler = schedulerBuilder.build();
    scheduler.initialize();
    _scheduler = scheduler;
  }
}
