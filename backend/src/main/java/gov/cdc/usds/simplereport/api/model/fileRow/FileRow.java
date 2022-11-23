package gov.cdc.usds.simplereport.api.model.fileRow;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.List;

public interface FileRow {
  List<FeedbackMessage> validateHeaders();

  List<FeedbackMessage> validateIndividualValues();
}
