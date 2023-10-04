output "db_administrator_password" {
  value     = random_password.db_administrator_password.result
  sensitive = true
}
