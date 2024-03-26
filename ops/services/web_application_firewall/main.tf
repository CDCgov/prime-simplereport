resource "azurerm_web_application_firewall_policy" "sr_waf_policy" {
  name                = "${var.name}-wafpolicy"
  resource_group_name = var.resource_group_name
  location            = var.resource_group_location

  custom_rules {
    name      = "Block_Sanctioned_Entities"
    priority  = 1
    rule_type = "MatchRule"

    match_conditions {
      match_variables {
        variable_name = "RemoteAddr"
      }
      operator           = "GeoMatch"
      negation_condition = false
      match_values = [
        "AF", //Afghanistan (ITAR)
        "AL", //Albania (OFAC)
        "BA", //Bosnia and Herzegovinia (OFAC)
        "BG", //Bulgaria (OFAC)
        "BY", //Belarus (ITAR, OFAC)
        "CD", //Democratic Republic of the Congo (ITAR)
        "CF", //Central African Republic (ITAR, OFAC)
        "CG", //Congo (ITAR, OFAC)
        "CI", //Côte d'Ivoire (ITAR)
        "CN", //People's Republic of China (EAR, ITAR)
        "CU", //Cuba (EAR, ITAR, OFAC)
        "CY", //Cyprus (ITAR)
        "ER", //Eritrea (ITAR)
        "ET", //Ethiopia (ITAR-adjacent, due to ongoing conflict with Eritrea)
        "GE", //Georgia (preemptive, due to presence of separatist regions sympathetic to Russian Federation)
        "HK", //Hong Kong SAR (due to oversight by People's Republic of China)
        "HR", //Croatia (OFAC)
        "HT", //Haiti (ITAR)
        "IQ", //Iraq (EAR, ITAR, OFAC)
        "IR", //Iran, Islamic Republic of (EAR, ITAR, OFAC)
        "KP", //Korea, Democratic People's Republic of (EAR, ITAR, OFAC)
        "LB", //Lebanon (ITAR, OFAC)
        "LK", //Sri Lanka (ITAR)
        "LR", //Liberia (ITAR, OFAC)
        "LY", //Libya (ITAR, OFAC)
        "MD", //Moldova, Republic of (preemptive, due to presence of separatist regions sympathetic to Russian Federation)
        "ME", //Montenegro (OFAC)
        "MK", //North Macedonia (OFAC)
        "MM", //Myanmar (ITAR)
        "MO", //Macao SAR (due to oversight by People's Republic of China)
        "NI", //Nicaragua (preemptive, due to association with sanctioned entities)
        "RS", //Serbia (OFAC)
        "RU", //Russian Federation (EAR, OFAC)
        "SO", //Somalia (ITAR, OFAC)
        "SY", //Syrian Arab Republic (EAR, ITAR, OFAC)
        "UA", //Ukraine (OFAC, due to occupation by the Russian Federation)
        "VE", //Venezuela (EAR, ITAR, OFAC)
        "VN", //Vietnam (ITAR)
        "XK", //Kosovo (OFAC)
        "YE", //Yemen (OFAC)
        "ZW"  //Zimbabwe (ITAR)
      ]
    }
    action = "Block"
  }

  managed_rules {

    /*
     * Exclusions for specific request components.
     * Azure supports three specific values for match_variable:
     *  - RequestArgNames
     *  - RequestCookieNames
     *  - RequestHeaderNames
     */
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "ai_session" //Part of Azure Application Insights
      selector_match_operator = "StartsWith"
    }
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "ai_user" //Part of Azure Application Insights
      selector_match_operator = "StartsWith"
    }
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "iss"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "ssm_au"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestCookieNames"
      selector                = "ssm_au_c"
      selector_match_operator = "Equals"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "iss"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.testResultList"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.namePrefixMatch"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.street"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.orderingProviderStreet"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "operations"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "map"
      selector_match_operator = "Equals"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "phoneNumbers.number"
      selector_match_operator = "Contains"
    }
    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.model"
      selector_match_operator = "Equals"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "query"
      selector_match_operator = "Equals"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "visualization_settings"
      selector_match_operator = "Equals"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "query.filters"
      selector_match_operator = "Contains"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "variables.email"
      selector_match_operator = "Contains"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "result_metadata.effective_type"
      selector_match_operator = "Contains"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "dataset_query.query"
      selector_match_operator = "Contains"
    }

    exclusion {
      match_variable          = "RequestArgNames"
      selector                = "query.joins"
      selector_match_operator = "Contains"
    }

    managed_rule_set {
      type    = "OWASP"
      version = "3.2"

      /*
       * Each rule group in the OWASP ruleset can be overridden. These blocks contain a list of
       * rules within each specific group that we've chosen to override, due to how the application
       * is structured.
       *
       * These rules should be periodically reviewed for relevance.
       */
      rule_group_override {
        rule_group_name = "REQUEST-920-PROTOCOL-ENFORCEMENT"
        dynamic "rule" {
          for_each = [
            "920300",
            "920320"
          ]
          content {
            id      = rule.value
            enabled = false
          }
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-932-APPLICATION-ATTACK-RCE"
        dynamic "rule" {
          for_each = [
            "932100",
            "932105",
            "932115"
          ]
          content {
            id      = rule.value
            enabled = false
          }
        }
      }

      rule_group_override {
        rule_group_name = "REQUEST-942-APPLICATION-ATTACK-SQLI"
        dynamic "rule" {
          for_each = [
            "942110",
            "942150",
            "942190",
            "942200",
            "942260",
            "942330",
            "942361",
            "942370",
            "942410",
            "942430",
            "942440"
          ]
          content {
            id      = rule.value
            enabled = false
          }
        }
      }
    }
  }

  policy_settings {
    enabled                     = true
    mode                        = "Prevention" //Can use "Detection" for testing, to see which requests would be blocked. "Prevention" turns on active blocking.
    request_body_check          = true
    file_upload_limit_in_mb     = 100
    max_request_body_size_in_kb = 128 //Can go to 2000 in modern provider version. Proposed is 1024.
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }
}
