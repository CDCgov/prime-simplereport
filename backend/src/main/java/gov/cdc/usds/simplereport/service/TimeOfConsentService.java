package gov.cdc.usds.simplereport.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import gov.cdc.usds.simplereport.db.repository.TimeOfConsentRepository;

@Service
@Transactional(readOnly = false)
public class TimeOfConsentService {
    @Autowired
    private TimeOfConsentRepository tocrepo;

    public TimeOfConsent storeTimeOfConsent(PatientLink pl) {
        TimeOfConsent toc = new TimeOfConsent(pl);
        return tocrepo.save(toc);
    }

    public List<TimeOfConsent> getTimeOfConsent(PatientLink pl) {
        return tocrepo.findAllByPatientLink(pl);
    }

}
