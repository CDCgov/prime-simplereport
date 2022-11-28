package gov.cdc.usds.simplereport.api.model.filerow;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class FileRow {
  public abstract List<FeedbackMessage> validateRequiredFields();

  public abstract List<FeedbackMessage> validateIndividualValues();

  List<FeedbackMessage> getPossibleErrorsFromFields(Field[] fields, FileRow fr) {
    List<FeedbackMessage> errors = new ArrayList<>();
    Arrays.stream(fields)
        .forEach(
            field -> {
              try {
                errors.addAll(invokeGetPossibleError(field, fr));
              } catch (IllegalAccessException
                  | NoSuchMethodException
                  | InvocationTargetException e) {
                log.error("Error while invoking getPossibleError", e);
                throw new GenericGraphqlException();
              }
            });
    return errors;
  }

  List<FeedbackMessage> invokeGetPossibleError(Field field, FileRow fr)
      throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
    if (field.getType().equals(ValueOrError.class)) {
      field.setAccessible(true);
      Object valueOrError = field.get(fr);
      if (valueOrError != null) {
        Method getPossibleErrorMethod = ValueOrError.class.getDeclaredMethod("getPossibleError");
        return (List<FeedbackMessage>) getPossibleErrorMethod.invoke(valueOrError);
      }
    }
    return Collections.emptyList();
  }
}
