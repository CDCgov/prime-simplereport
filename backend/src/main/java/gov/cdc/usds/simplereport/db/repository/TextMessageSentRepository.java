package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.TextMessageSent;
import org.springframework.data.jpa.repository.EntityGraph;

public interface TextMessageSentRepository extends AuditedEntityRepository<TextMessageSent> {
  @EntityGraph(attributePaths = {"patientLink.testOrder.patient.phoneNumbers"})
  TextMessageSent findByTwilioMessageId(String id);
}
