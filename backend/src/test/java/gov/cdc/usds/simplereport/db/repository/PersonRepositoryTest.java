package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

class PersonRepositoryTest extends BaseRepositoryTest {

  @Autowired private PersonRepository _repo;
  @Autowired private OrganizationRepository _orgRepo;
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void doPersonOperations() {
    Organization org = _orgRepo.save(new Organization("Here", "there"));
    Organization other = _orgRepo.save(new Organization("There", "where?"));

    _repo.save(
        new Person(
            org,
            "lookupid",
            "Joe",
            null,
            "Schmoe",
            null,
            LocalDate.now(),
            _dataFactory.getAddress(),
            "(123) 456-7890",
            PersonRole.VISITOR,
            "",
            null,
            "",
            "",
            false,
            false));
    List<Person> found =
        _repo
            .findAllByOrganization(
                org,
                false,
                PageRequest.of(
                    PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                    PersonService.DEFAULT_PAGINATION_PAGESIZE))
            .toList();
    assertEquals(1, found.size());
    assertEquals("Joe", found.get(0).getFirstName());
    found =
        _repo
            .findAllByOrganization(
                other,
                false,
                PageRequest.of(
                    PersonService.DEFAULT_PAGINATION_PAGEOFFSET,
                    PersonService.DEFAULT_PAGINATION_PAGESIZE))
            .toList();
    assertEquals(0, found.size());
  }
}
