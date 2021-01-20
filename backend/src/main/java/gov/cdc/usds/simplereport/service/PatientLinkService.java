package gov.cdc.usds.simplereport.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.repository.PatientLinkRepository;

@Service
@Transactional(readOnly = true)
public class PatientLinkService {
    private PatientLinkRepository _plrepo;

    public PatientLinkService(PatientLinkRepository plrepo, TestOrderRepository torepo) {
        _plrepo = plrepo;
    }

    public PatientLink getPatientLinkById(String internalId) {
        UUID actualId = UUID.fromString(internalId);
        return _plrepo.findById(actualId)
                .orElseThrow(() -> new IllegalGraphqlArgumentException("No patient link with that ID was found"));
    }

    public List<PatientLink> fetchPatientLinks() {
        return _plrepo.findAll();
    }

    public PatientLink refreshPatientLink(String testOrderUuid) {
        PatientLink pl = _plrepo.findByTestOrderId(testOrderUuid).orElseThrow(
                () -> new IllegalGraphqlArgumentException("No patient link with that test order ID was found"));
        return _plrepo.save(pl);
    }
}
