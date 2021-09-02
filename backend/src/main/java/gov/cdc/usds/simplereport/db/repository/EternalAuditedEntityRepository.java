package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.EternalAuditedEntity;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

/**
 * Base repository interface for soft-deletable entities. Should implement all CRUD operations, but
 * with restrictions against unintentionally retrieving soft-deleted items.
 *
 * @param <T> a soft-delete-only subclass of {@link EternalAuditedEntity}.
 */
@NoRepositoryBean
public interface EternalAuditedEntityRepository<T extends EternalAuditedEntity>
    extends AuditedEntityRepository<T> {

  String BASE_QUERY = "from #{#entityName} e where e.isDeleted = false ";
  String BASE_ALLOW_DELETED_QUERY = "from #{#entityName} e where ";

  @Override
  @Query(BASE_QUERY)
  List<T> findAll();

  @Override
  @Modifying // (flushAutomatically = true) // probably not? It's not clear when this would arise
  // actually
  @Query("update #{#entityName} e set e.isDeleted = true where e = :victim")
  void delete(T victim);
}
