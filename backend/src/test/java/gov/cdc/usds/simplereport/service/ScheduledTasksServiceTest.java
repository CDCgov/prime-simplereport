package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.boot.task.TaskSchedulerBuilder;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

class ScheduledTasksServiceTest {
  @Test
  void scheduleAccountReminderEmails_ensureScheduling() {
    String cronExpression = "0 0 1 * * *";
    String tzString = "America/New_York";

    ThreadPoolTaskScheduler scheduler = mock(ThreadPoolTaskScheduler.class);
    TaskSchedulerBuilder schedulerBuilder = mock(TaskSchedulerBuilder.class);
    ArgumentCaptor<CronTrigger> captureTrigger = ArgumentCaptor.forClass(CronTrigger.class);
    ArgumentCaptor<Runnable> captureMethod = ArgumentCaptor.forClass(Runnable.class);

    ReminderService reminderService = mock(ReminderService.class);

    when(schedulerBuilder.build()).thenReturn(scheduler);

    new ScheduledTasksService(reminderService, schedulerBuilder)
        .scheduleAccountReminderEmails(cronExpression, tzString);

    verify(scheduler, Mockito.times(1)).initialize();
    verify(scheduler, Mockito.times(1)).schedule(captureMethod.capture(), captureTrigger.capture());

    CronTrigger trigger = captureTrigger.getValue();
    assertEquals(cronExpression, trigger.getExpression());

    verify(reminderService, never()).sendAccountReminderEmails();
    captureMethod.getValue().run();
    verify(reminderService, times(1)).sendAccountReminderEmails();
  }
}
