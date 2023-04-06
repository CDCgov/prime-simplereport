package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;

public interface PhoneNumberRepository extends AuditedEntityRepository<PhoneNumber> {
  List<PhoneNumber> findAllByNumberAndType(String number, PhoneType type);

  List<PhoneNumber> findAllByPersonInternalId(UUID personId);

  List<List<PhoneNumber>> findAllByPersonInternalIdIn(Collection<UUID> personIds);

  List<PhoneNumber> findAllByInternalIdIn(Collection<UUID> phoneIds);

  @Query(
      value =
          "select * from {h-schema}phone_number where internal_id in (select p.primary_phone_internal_id from {h-schema}person p where p.internal_id in :personIds)",
      nativeQuery = true)
  List<PhoneNumber> findPrimaryPhoneNumberByPersonInternalIdIn(Collection<UUID> personIds);
}
