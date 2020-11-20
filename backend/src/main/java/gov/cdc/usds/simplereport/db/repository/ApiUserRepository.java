package gov.cdc.usds.simplereport.db.repository;

import java.util.UUID;

import org.springframework.data.repository.CrudRepository;

import gov.cdc.usds.simplereport.db.model.ApiUser;

public interface ApiUserRepository extends CrudRepository<ApiUser, UUID> {

}
