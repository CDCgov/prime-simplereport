package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import gov.cdc.usds.simplereport.db.repository.PersonRepository;
import org.springframework.stereotype.Component;

@Component
public class QueueItemPatientDataLoader extends KeyedDataLoaderFactory<UUID, Person> {
    public static final String KEY = "testOrder[*].patient";

    @Override
    public String getKey() {
        return KEY;
    }

    QueueItemPatientDataLoader(PersonRepository personRepository) {
        super(
                personId ->
                        CompletableFuture.supplyAsync(
                                () -> {
                                    Map<UUID, Person> found =
                                            personRepository.findAllByInternalIdIn(personId).stream()
                                                    .collect(Collectors.toMap(Person::getInternalId, s -> s));

                                    return personId.stream()
                                            .map(to -> found.getOrDefault(to, null))
                                            .collect(Collectors.toList());
                                }));
    }
}
