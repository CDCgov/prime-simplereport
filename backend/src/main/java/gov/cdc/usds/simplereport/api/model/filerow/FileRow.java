package gov.cdc.usds.simplereport.api.model.filerow;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.List;

public interface FileRow {
  List<FeedbackMessage> validateRequiredFields();

  List<FeedbackMessage> validateIndividualValues();
}
