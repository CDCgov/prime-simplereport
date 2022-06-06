package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface PhoneNumberRepository extends AuditedEntityRepository<PhoneNumber> {
  List<PhoneNumber> findAllByNumberAndType(String number, PhoneType type);

  List<PhoneNumber> findAllByPersonInternalId(UUID personId);

  List<List<PhoneNumber>> findAllByPersonInternalIdIn(Collection<UUID> personIds);

  List<PhoneNumber> findAllByInternalIdIn(Collection<UUID> phoneIds);
}
