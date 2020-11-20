package gov.cdc.usds.simplereport.db.repository;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.NoRepositoryBean;

import gov.cdc.usds.simplereport.db.model.AuditedEntity;

@NoRepositoryBean
public interface DeletableEntityRepository<T extends AuditedEntity> extends CrudRepository<T, UUID> {

}
