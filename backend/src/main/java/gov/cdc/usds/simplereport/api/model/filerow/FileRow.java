package gov.cdc.usds.simplereport.api.model.filerow;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.slf4j.Logger;

public interface FileRow {
  Logger log = org.slf4j.LoggerFactory.getLogger(FileRow.class);

  List<FeedbackMessage> validateRequiredFields();

  List<FeedbackMessage> validateIndividualValues();

  default List<FeedbackMessage> getPossibleErrorsFromFields(Field[] fields, FileRow fr) {
    List<FeedbackMessage> errors = new ArrayList<>();
    Arrays.stream(fields)
        .forEach(
            field -> {
              try {
                errors.addAll(invokeGetPossibleError(field, fr));
              } catch (IllegalAccessException e) {
                log.error("Error while invoking getPossibleError", e);
                throw new GenericGraphqlException();
              }
            });
    return errors;
  }

  default List<FeedbackMessage> invokeGetPossibleError(Field field, FileRow fr)
      throws IllegalAccessException {
    if (field.getType().equals(ValueOrError.class)) {
      ValueOrError valueOrError = (ValueOrError) field.get(fr);
      if (valueOrError != null) {
        return valueOrError.getPossibleError();
      }
    }
    return Collections.emptyList();
  }
}
