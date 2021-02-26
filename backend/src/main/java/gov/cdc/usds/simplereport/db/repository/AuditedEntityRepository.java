package gov.cdc.usds.simplereport.db.repository;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

import gov.cdc.usds.simplereport.db.model.AuditedEntity;

/**
 * Convenience specification of the templated {@link CrudRepository} interface, which
 * pre-fills that the primary key is a UUID.
 *
 * @param <T> the concrete entity class (or an intermediate base class).
 */
@NoRepositoryBean
public interface AuditedEntityRepository<T extends AuditedEntity> extends CrudRepository<T, UUID> {

}
