package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.only;
import static org.mockito.Mockito.verify;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ScheduledFuture;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.support.CronTrigger;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;


public class ScheduledTasksServiceTest {

    @Test
    void scheduleUploads_oneSchedule_scheduled() {
        String cronExpression = "0 0 0 * * *";
        List<String> uploadSchedule = List.of(cronExpression);
        DataHubConfig config = new DataHubConfig(true, "http://mock.com", 20, "NOPE", "", uploadSchedule,
                null);

        TaskScheduler scheduler = mock(TaskScheduler.class);
        ArgumentCaptor<CronTrigger> captureTrigger = ArgumentCaptor.forClass(CronTrigger.class);
        ArgumentCaptor<Runnable> captureMethod = ArgumentCaptor.forClass(Runnable.class);

        DataHubUploaderService uploader = mock(DataHubUploaderService.class);

        Map<String, ScheduledFuture<?>> scheduledUploads = new ScheduledTasksService(uploader, scheduler)
                .scheduleUploads(config);
        assertEquals(Set.of(cronExpression), scheduledUploads.keySet());

        verify(scheduler, only()).schedule(captureMethod.capture(), captureTrigger.capture());
        CronTrigger trigger = captureTrigger.getValue();
        assertEquals(cronExpression, trigger.getExpression());
        verify(uploader, never()).dataHubUploaderTask();
        captureMethod.getValue().run();
        verify(uploader, only()).dataHubUploaderTask();
    }

    @Test
    void scheduleUploads_noSchedule_nothingScheduled() {
        DataHubConfig config = new DataHubConfig(true, "http://mock.com", 20, "NOPE", "", Collections.emptyList(),
                null);

        TaskScheduler scheduler = mock(TaskScheduler.class);
        ArgumentCaptor<CronTrigger> captureTrigger = ArgumentCaptor.forClass(CronTrigger.class);
        ArgumentCaptor<Runnable> captureMethod = ArgumentCaptor.forClass(Runnable.class);

        DataHubUploaderService uploader = mock(DataHubUploaderService.class);

        Map<String, ScheduledFuture<?>> scheduledUploads = new ScheduledTasksService(uploader, scheduler)
                .scheduleUploads(config);
        assertEquals(Collections.emptyMap(), scheduledUploads);

        verify(scheduler, never()).schedule(captureMethod.capture(), captureTrigger.capture());
        verify(uploader, never()).dataHubUploaderTask();
    }
}
