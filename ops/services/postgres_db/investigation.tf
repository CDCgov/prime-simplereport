# These are disabled by default to avoid performance impact.

# https://www.postgresql.org/docs/current/runtime-config-logging.html
resource "azurerm_postgresql_flexible_server_configuration" "log_min_duration_statement" {
  name      = "log_min_duration_statement"
  server_id = azurerm_postgresql_flexible_server.db.id
  # To enable: this is in milliseconds, update this to a positive value in milliseconds to enable this logging
  # To disable: update this to -1
  value = -1
}

# https://www.postgresql.org/docs/current/runtime-config-statistics.html
resource "azurerm_postgresql_flexible_server_configuration" "track_io_timing" {
  name      = "track_io_timing"
  server_id = azurerm_postgresql_flexible_server.db.id
  # To enable: update this to "on" to enable
  # To disable: update this to "off"
  value = "off"
}

# https://www.postgresql.org/docs/current/pgstatstatements.html
resource "azurerm_postgresql_flexible_server_configuration" "pg_stat_statements_track" {
  name      = "pg_stat_statements.track"
  server_id = azurerm_postgresql_flexible_server.db.id
  # To enable: update this to "top" or "all" to enable'
  # To disable: update this to "none"
  value = "none"
}

# https://www.postgresql.org/docs/current/auto-explain.html
resource "azurerm_postgresql_flexible_server_configuration" "auto_explain_log_analyze" {
  name      = "auto_explain.log_analyze"
  server_id = azurerm_postgresql_flexible_server.db.id
  # To enable: update this to "on" to enable
  # To disable: update this to "off"
  value = "off"
}

# https://www.postgresql.org/docs/current/auto-explain.html
resource "azurerm_postgresql_flexible_server_configuration" "auto_explain_log_min_duration" {
  name      = "auto_explain.log_min_duration"
  server_id = azurerm_postgresql_flexible_server.db.id
  # To enable: this is in milliseconds, update this to a positive value in milliseconds to enable this logging
  # To disable: update this to -1
  value = -1
}
