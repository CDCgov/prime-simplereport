package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.PatientBulkUploadFileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service to upload a roster of patient data given a CSV input. Formerly restricted to superusers
 * but now (almost) available to end users.
 *
 * <p>Updated by emmastephenson on 10/24/2022
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class PatientBulkUploadService {

  private final PatientBulkUploadFileValidator _patientBulkUploadFileValidator;
  private final PatientBulkUploadServiceAsync _patientBulkUploadServiceAsync;

  // This authorization will change once we open the feature to end users
  //  @AuthorizationConfiguration.RequirePermissionCreatePatientAtFacility
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public PatientBulkUploadResponse processPersonCSV(InputStream csvStream, UUID facilityId)
      throws IllegalArgumentException {

    PatientBulkUploadResponse result = new PatientBulkUploadResponse();

    byte[] content;

    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      log.error("Error reading patient bulk upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
    }

    List<FeedbackMessage> errors =
        _patientBulkUploadFileValidator.validate(new ByteArrayInputStream(content));

    if (!errors.isEmpty()) {
      result.setStatus(UploadStatus.FAILURE);
      result.setErrors(errors.toArray(FeedbackMessage[]::new));
      return result;
    }

    _patientBulkUploadServiceAsync.savePatients(content, facilityId);
    result.setStatus(UploadStatus.SUCCESS);
    return result;
  }
}
