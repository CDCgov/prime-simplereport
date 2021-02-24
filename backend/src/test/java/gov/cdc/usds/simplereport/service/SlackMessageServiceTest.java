package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.eq;

import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.service.SlackMessageService.SlackBlock;
import gov.cdc.usds.simplereport.service.SlackMessageService.SlackBlockType;
import gov.cdc.usds.simplereport.service.SlackMessageService.SlackMessage;
import gov.cdc.usds.simplereport.service.SlackMessageService.SlackTextBlock;

import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

@SuppressWarnings("unchecked")
public class SlackMessageServiceTest {

    @Test
    public void sendMessage_noDividers_formatOk() {
        RestTemplateBuilder builder = Mockito.mock(RestTemplateBuilder.class);
        RestTemplate template = Mockito.mock(RestTemplate.class);
        ArgumentCaptor<RequestEntity<SlackMessageService.SlackMessage>> captor = ArgumentCaptor
                .forClass(RequestEntity.class);
        when(builder.build()).thenReturn(template);
        when(template.exchange(captor.capture(), eq(String.class)))
                .thenReturn(new ResponseEntity<String>("Yo", HttpStatus.OK));
        ;
        DataHubConfig config = new DataHubConfig(false, null, 0, null, "https://hooks.slack.com/fake", null, null);
        SlackMessageService service = new SlackMessageService(config, builder);
        service.sendSlackChannelMessage("Hello, test harness", List.of("Humpty", "Dumpty"), false);
        verify(builder).build();
        RequestEntity<SlackMessageService.SlackMessage> req = captor.getValue();
        SlackMessage message = req.getBody();
        assertEquals(3, message.getBlocks().size());
        assertEquals(List.of(SlackBlockType.header, SlackBlockType.section, SlackBlockType.section),
                message.getBlocks().stream().map(SlackBlock::getType).collect(Collectors.toList()));
        assertEquals(SlackMessageService.SlackBlockType.header, message.getBlocks().get(0).getType());
        assertEquals(List.of("Hello, test harness", "Humpty", "Dumpty"),
                message.getBlocks().stream().map(this::getText).collect(Collectors.toList()));
        assertEquals(List.of(SlackBlockType.plain_text, SlackBlockType.mrkdwn, SlackBlockType.mrkdwn),
                message.getBlocks().stream().map(this::getNestedType).collect(Collectors.toList()));
    }

    private SlackBlockType getNestedType(SlackBlock blk) {
        SlackTextBlock textBlk = (SlackTextBlock) blk;
        SlackTextBlock nested = (SlackTextBlock) textBlk.getText();
        return nested.getType();
    }

    private String getText(SlackBlock blk) {
        SlackTextBlock textBlk = (SlackTextBlock) blk;
        SlackTextBlock nested = (SlackTextBlock) textBlk.getText();
        return (String) nested.getText();
    }
}
