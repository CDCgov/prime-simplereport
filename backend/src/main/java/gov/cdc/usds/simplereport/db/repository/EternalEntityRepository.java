package gov.cdc.usds.simplereport.db.repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import gov.cdc.usds.simplereport.db.model.EternalEntity;

/**
 * Base repository interface for soft-deletable entities. Should implement all CRUD operations, but with
 * restrictions against unintentionally retrieving soft-deleted items.
 *
 * @param <T> a soft-delete-only subclass of {@link EternalEntity}.
 */
@NoRepositoryBean
public interface EternalEntityRepository<T extends EternalEntity> extends AuditedEntityRepository<T> {

	public static final String BASE_QUERY = "from #{#entityName} e where not e.isDeleted";

	@Override
	@Query(BASE_QUERY)
	public Iterable<T> findAll();

	@Override
	@Modifying
	@Query("update #{#entityName} e set e.isDeleted = true where e = :victim")
	public void delete(T victim);

}
