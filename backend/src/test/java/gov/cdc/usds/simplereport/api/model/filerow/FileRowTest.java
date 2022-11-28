package gov.cdc.usds.simplereport.api.model.filerow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.lang.reflect.InvocationTargetException;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class FileRowTest {
  @Test
  void getPossibleErrorsFromFields_catchesInvocationTargetException()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {

    var fileRow = Mockito.spy(new TestResultRow(Collections.emptyMap()));
    doThrow(new InvocationTargetException(new Exception()))
        .when(fileRow)
        .invokeGetPossibleError(any(), any());
    var declaredFields = TestResultRow.class.getDeclaredFields();

    assertThrows(
        GenericGraphqlException.class,
        () -> fileRow.getPossibleErrorsFromFields(declaredFields, fileRow));
  }

  @Test
  void getPossibleErrorsFromFields_catchesNoSuchMethodException()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {

    var fileRow = Mockito.spy(new TestResultRow(Collections.emptyMap()));
    doThrow(new NoSuchMethodException()).when(fileRow).invokeGetPossibleError(any(), any());
    var declaredFields = TestResultRow.class.getDeclaredFields();

    assertThrows(
        GenericGraphqlException.class,
        () -> fileRow.getPossibleErrorsFromFields(declaredFields, fileRow));
  }

  @Test
  void getPossibleErrorsFromFields_catchesIllegalAccessException()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {

    var fileRow = Mockito.spy(new TestResultRow(Collections.emptyMap()));
    doThrow(new NoSuchMethodException()).when(fileRow).invokeGetPossibleError(any(), any());
    var declaredFields = TestResultRow.class.getDeclaredFields();
    assertThrows(
        GenericGraphqlException.class,
        () -> fileRow.getPossibleErrorsFromFields(declaredFields, fileRow));
  }

  @Test
  void invokeGetPossibleError_returnsErrorsFromGetPossibleError()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {

    class TestFileRow implements FileRow {
      final ValueOrError val = new ValueOrError(new FeedbackMessage());

      @Override
      public List<FeedbackMessage> validateRequiredFields() {
        return null;
      }

      @Override
      public List<FeedbackMessage> validateIndividualValues() {
        return null;
      }
    }
    var fileRow = new TestFileRow();

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0], fileRow);

    assertThat(actual).hasSize(1);
  }

  @Test
  void invokeGetPossibleError_returnsEmptyListFromGetPossibleError_whenGivenNotValueOrError()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    class TestFileRow implements FileRow {
      String val;

      @Override
      public List<FeedbackMessage> validateRequiredFields() {
        return null;
      }

      @Override
      public List<FeedbackMessage> validateIndividualValues() {
        return null;
      }
    }
    var fileRow = new TestFileRow();

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0], fileRow);

    assertThat(actual).isEmpty();
  }

  @Test
  void invokeGetPossibleError_returnsEmptyListFromGetPossibleError_whenValueOrErrorIsNull()
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    class TestFileRow implements FileRow {
      ValueOrError val;

      @Override
      public List<FeedbackMessage> validateRequiredFields() {
        return null;
      }

      @Override
      public List<FeedbackMessage> validateIndividualValues() {
        return null;
      }
    }
    var fileRow = new TestFileRow();

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0], fileRow);

    assertThat(actual).isEmpty();
  }
}
