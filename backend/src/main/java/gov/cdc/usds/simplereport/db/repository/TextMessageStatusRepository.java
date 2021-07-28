package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import gov.cdc.usds.simplereport.db.model.TextMessageStatus;
import java.util.List;

public interface TextMessageStatusRepository extends AuditedEntityRepository<TextMessageStatus> {
  List<TextMessageStatus> findAllByTextMessageSent(TextMessageSent message);
}
