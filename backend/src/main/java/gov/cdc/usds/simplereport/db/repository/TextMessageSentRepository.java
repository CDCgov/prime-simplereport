package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.TextMessageSent;

public interface TextMessageSentRepository extends AuditedEntityRepository<TextMessageSent> {
  TextMessageSent findByTwilioMessageId(String id);
}
