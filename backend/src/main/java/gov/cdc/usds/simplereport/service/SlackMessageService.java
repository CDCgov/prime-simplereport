package gov.cdc.usds.simplereport.service;

import java.util.ArrayList;
import java.util.List;

import org.json.JSONException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;

/**
 * Utility service for sending slack messages by way of the webhook configured
 * in {@link DataHubConfig#getSlackNotifyWebhookUrl()}
 */
@Service
public class SlackMessageService {

    private static final Logger LOG = LoggerFactory.getLogger(SlackMessageService.class);

    private DataHubConfig _config;
    private RestTemplateBuilder _builder;

    public SlackMessageService(DataHubConfig config, RestTemplateBuilder builder) {
        _config = config;
        _builder = builder;
    }

    public void sendSlackChannelMessage(String titleMsg, List<String> markupMsgs, Boolean separateMsgs) {
        if (!_config.getSlackNotifyWebhookUrl().startsWith("https://hooks.slack.com/")) {
            LOG.error("SlackChannelNotConfigured. Message not sent Title: '{}' Body: {}", titleMsg, markupMsgs);
            return;
        } else {
            // log the result since slack may be down.
            LOG.debug("Attempting to send slack message {}: {}", titleMsg, markupMsgs);
        }

        try {
            RequestEntity<SlackMessage> r = RequestEntity.put(_config.getSlackNotifyWebhookUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(SlackMessage.build(titleMsg, markupMsgs, separateMsgs));

            ResponseEntity<String> responseBody = _builder.build().exchange(r, String.class);
            LOG.debug("Slack responded {}", responseBody);
        } catch (RestClientException | JSONException err) {
            LOG.error("sendSlackChannelMessage failed", err);
            LOG.info("Intended slackMessage Title: '{}'  Body: '{}'", titleMsg, markupMsgs);
        }
    }

    enum SlackBlockType {
        header, plain_text, section, divider, mrkdwn;
    }

    public static class SlackMessage {
        List<SlackBlock> blocks;

        public SlackMessage(List<SlackBlock> daBlocks) {
            blocks = daBlocks;
        }

        static SlackMessage build(String titleMsg, List<String> markupMsgs, boolean separateMsgs) {
            List<SlackBlock> blocks = new ArrayList<>();
            blocks.add(SlackTextBlock.headerBlock(titleMsg));
            markupMsgs.forEach(msg -> {
                blocks.add(SlackTextBlock.markdownSectionBlock(msg));
                if (separateMsgs) {
                    blocks.add(SlackTextBlock.divider());
                }
            });
            return new SlackMessage(blocks);
        }

        public List<SlackBlock> getBlocks() {
            return blocks;
        }
    }

    public static class SlackBlock {
        SlackBlockType type;

        public SlackBlock(SlackBlockType type) {
            this.type = type;
        }

        public SlackBlockType getType() {
            return type;
        }
    }

    public static class SlackTextBlock extends SlackBlock {
        Object text;

        public SlackTextBlock(SlackBlockType type, Object text) {
            super(type);
            this.text = text;
        }

        public Object getText() {
            return text;
        }

        static SlackTextBlock headerBlock(String text) {
            return new SlackTextBlock(SlackBlockType.header, new SlackTextBlock(SlackBlockType.plain_text, text));
        }

        static SlackTextBlock markdownSectionBlock(String markdownText) {
            return new SlackTextBlock(SlackBlockType.section, new SlackTextBlock(SlackBlockType.mrkdwn, markdownText));
        }

        static SlackBlock divider() {
            return new SlackBlock(SlackBlockType.divider);
        }
    }
}
