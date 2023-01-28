package gov.cdc.usds.simplereport.api.supporteddisease;

import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SupportedDiseaseDataLoaderService {
  final DiseaseService diseaseService;

  public Map<UUID, SupportedDisease> getSupportedDisease(Set<UUID> supportedDiseaseId) {
    Map<UUID, SupportedDisease> supportedDiseasesMap =
        diseaseService.getKnownSupportedDiseasesMap();

    var found = new HashMap<UUID, SupportedDisease>();
    supportedDiseaseId.forEach(uuid -> found.put(uuid, supportedDiseasesMap.get(uuid)));
    return found;
  }
}
