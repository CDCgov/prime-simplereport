package gov.cdc.usds.simplereport.service.dataloader;

import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.repository.PatientAnswersRepository;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class PatientAnswersDataLoader extends KeyedDataLoaderFactory<UUID, PatientAnswers> {
    public static final String KEY = "testResults[*].patientAnswers";

    @Override
    public String getKey() {
        return KEY;
    }

    PatientAnswersDataLoader(PatientAnswersRepository patientAnswersRepository) {
        super(
                testOrderIds ->
                        CompletableFuture.supplyAsync(
                                () -> {
                                    Map<UUID, PatientAnswers> found =
                                            patientAnswersRepository.findAllByTestOrderInternalIdIn(testOrderIds).stream()
                                                    .collect(Collectors.toMap(PatientAnswers::getTestOrderId, s -> s));

                                    return testOrderIds.stream()
                                            .map(to -> found.getOrDefault(to, null))
                                            .collect(Collectors.toList());
                                }));
    }
}
