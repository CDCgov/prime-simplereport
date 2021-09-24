package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONException;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;

/**
 * Utility service for sending slack messages by way of the webhook configured in {@link
 * DataHubConfig#getSlackNotifyWebhookUrl()}
 */
@Service
@Slf4j
public class SlackMessageService {

  private DataHubConfig _config;
  private RestTemplateBuilder _builder;

  public SlackMessageService(DataHubConfig config, RestTemplateBuilder builder) {
    _config = config;
    _builder = builder;
  }

  public void sendSlackChannelMessage(
      String titleMsg, List<String> markupMsgs, Boolean separateMsgs) {
    if (!_config.getSlackNotifyWebhookUrl().startsWith("https://hooks.slack.com/")) {
      log.error(
          "SlackChannelNotConfigured. Message not sent Title: '{}' Body: {}", titleMsg, markupMsgs);
      return;
    } else {
      // log the result since slack may be down.
      log.debug("Attempting to send slack message {}: {}", titleMsg, markupMsgs);
    }

    try {
      RequestEntity<SlackMessage> r =
          RequestEntity.put(_config.getSlackNotifyWebhookUrl())
              .contentType(MediaType.APPLICATION_JSON)
              .body(SlackMessage.build(titleMsg, markupMsgs, separateMsgs));

      ResponseEntity<String> responseBody = _builder.build().exchange(r, String.class);
      log.debug("Slack responded {}", responseBody);
    } catch (RestClientException | JSONException err) {
      log.error("sendSlackChannelMessage failed", err);
      log.info("Intended slackMessage Title: '{}'  Body: '{}'", titleMsg, markupMsgs);
    }
  }

  enum SlackBlockType {
    header,
    plain_text,
    section,
    divider,
    mrkdwn;
  }

  /**
   * A slack message body for the webhook.
   *
   * @see https://api.slack.com/messaging/webhooks
   * @see https://app.slack.com/block-kit-builder/
   */
  public static class SlackMessage {
    List<SlackBlock> blocks;

    public SlackMessage(List<SlackBlock> daBlocks) {
      blocks = daBlocks;
    }

    static SlackMessage build(String titleMsg, List<String> markupMsgs, boolean separateMsgs) {
      List<SlackBlock> blocks = new ArrayList<>();
      blocks.add(SlackTextBlock.headerBlock(titleMsg));
      markupMsgs.forEach(
          msg -> {
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
      return new SlackTextBlock(
          SlackBlockType.header, new SlackTextBlock(SlackBlockType.plain_text, text));
    }

    static SlackTextBlock markdownSectionBlock(String markdownText) {
      return new SlackTextBlock(
          SlackBlockType.section, new SlackTextBlock(SlackBlockType.mrkdwn, markdownText));
    }

    static SlackBlock divider() {
      return new SlackBlock(SlackBlockType.divider);
    }
  }
}
