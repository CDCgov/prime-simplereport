package gov.cdc.usds.simplereport.api.model.filerow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class FileRowTest {
  @Test
  void getPossibleErrorsFromFields_catchesIllegalAccessException() throws IllegalAccessException {
    var fileRow = Mockito.spy(new TestResultRow(Collections.emptyMap()));
    doThrow(new IllegalAccessException()).when(fileRow).invokeGetPossibleError(any());
    assertThrows(GenericGraphqlException.class, fileRow::getPossibleErrorsFromFields);
  }

  @Test
  void invokeGetPossibleError_returnsErrorsFromGetPossibleError() throws IllegalAccessException {
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

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0]);

    assertThat(actual).hasSize(1);
  }

  @Test
  void invokeGetPossibleError_returnsEmptyListFromGetPossibleError_whenGivenNotValueOrError()
      throws IllegalAccessException {
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

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0]);

    assertThat(actual).isEmpty();
  }

  @Test
  void invokeGetPossibleError_returnsEmptyListFromGetPossibleError_whenValueOrErrorIsNull()
      throws IllegalAccessException {
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

    var actual = fileRow.invokeGetPossibleError(TestFileRow.class.getDeclaredFields()[0]);

    assertThat(actual).isEmpty();
  }
}
