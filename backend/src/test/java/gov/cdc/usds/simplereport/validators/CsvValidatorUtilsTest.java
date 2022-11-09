package gov.cdc.usds.simplereport.validators;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonLocation;
import com.fasterxml.jackson.core.io.ContentReference;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

public class CsvValidatorUtilsTest {

  @Test
  void getNextRow_jsonException_throwsCsvProcessingException() throws IOException {
    CsvProcessingException thrown;
    try (var mockIterator = Mockito.mock(MappingIterator.class)) {
      var mockContentRef = Mockito.mock(ContentReference.class);
      RuntimeJsonMappingException exception = new RuntimeJsonMappingException("it broke");
      var location = new JsonLocation(mockContentRef, 10, 1, 5);
      when(mockIterator.next()).thenThrow(exception);
      when(mockIterator.getCurrentLocation()).thenReturn(location);
      thrown =
          assertThrows(
              CsvProcessingException.class, () -> CsvValidatorUtils.getNextRow(mockIterator));
    }

    assertEquals("it broke", thrown.getMessage());
    assertEquals(1, thrown.getLineNumber());
    assertEquals(5, thrown.getColumnNumber());
  }
}
