package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TestOrderPatientDataLoader extends KeyedDataLoaderFactory<UUID, Person> {
  public static final String KEY = "testOrder[*].patient";

  private static final Logger LOG = LoggerFactory.getLogger(TestOrderPatientDataLoader.class);

  @Override
  public String getKey() {
    return KEY;
  }

  TestOrderPatientDataLoader(PersonRepository personRepository) {
    super(
        personIds ->
            CompletableFuture.supplyAsync(
                () -> {
                  Map<UUID, Person> found =
                      personRepository.findAllByInternalIdIn(personIds).stream()
                          .collect(Collectors.toMap(Person::getInternalId, s -> s));

                  return personIds.stream()
                      .map(pid -> found.getOrDefault(pid, null))
                      .collect(Collectors.toList());
                }));
  }
}
