package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.repository.UploadRepository;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestResultUploadService {
  private final UploadRepository _repo;

  // todo auth annotation
  public String processResultCSV(InputStream csvStream) throws IllegalGraphqlArgumentException {

    // todo call the report stream api
    log.info("you hit the service!");

    //    _repo.save(upload);
    return "this area under construction";
  }
}
