resource "azurerm_web_application_firewall_policy" "example" {
  name                = "${var.name}-wafpolicy"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location

  custom_rules {
    name      = "IP_Allow"
    priority  = 1
    rule_type = "MatchRule"

    match_conditions {
      match_variables {
        variable_name = "RemoteAddr"
      }

      operator           = "IPMatch"
      negation_condition = false
      match_values       = ["192.168.1.0/24", "10.0.0.0/24"]
    }

    action = "Block"
  }

  custom_rules {
    name      = "US_Only"
    priority  = 2
    rule_type = "MatchRule"

    match_conditions {
      match_variables {
        variable_name = "RemoteAddr"
      }
      operator           = "GeoMatch"
      negation_condition = true
      match_values       = ["US"]
    }
    action = "Block"
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.1"
    }
  }

  policy_settings {
    enabled                     = true
    mode                        = "Prevention" //Can use "Detection" for testing, to see which requests would be blocked.
    request_body_check          = true
    file_upload_limit_in_mb     = 100
    max_request_body_size_in_kb = 128 //Can go to 2000 in modern provider version. Proposed is 1024.
  }
}