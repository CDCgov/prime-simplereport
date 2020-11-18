package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.db.model.Device;
import gov.cdc.usds.simplereport.db.model.TestResult;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Created by nickrobison on 11/17/20
 */
@Service
@Transactional(readOnly = false)
public class ResultService {

    private OrganizationService _os;
    private ResultRepository _repo;

    public ResultService(OrganizationService os, ResultRepository repo) {
        this._os = os;
        this._repo = repo;
    }

    public List<TestResult> getTestResults() {
        return _repo.findAllByOrganization(_os.getCurrentOrganization());
    }
}
