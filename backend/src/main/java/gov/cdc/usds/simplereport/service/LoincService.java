package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.LoincStaging;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoincService {

  private final LoincFhirClient loincFhirClient;
  private final LoincStagingRepository loincStagingRepository;

  public String getCodeSystemLookup(String code) {
    return loincFhirClient.getCodeSystemLookup(code);
  }

  public List<LoincStaging>  syncLabs() {

    return loincStagingRepository.findByLimit(20);
  }

}
