package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.Map;

public interface TemplateVariablesProvider {
  /**
   * Get the name of the template to use. This is the name of the template without path or
   * extension, so "template-name" for "resources/templates/template-name.html"
   *
   * @return resolvable name of template to be filled
   */
  @JsonIgnore
  String getTemplateName();

  /**
   * Convert object fields to parameters used to fill a template.
   *
   * @return map of variables used to fill a template
   */
  Map<String, Object> toTemplateVariables();
}
