resource "random_password" "db_administrator_password" {
  length           = 30
  special          = false
  override_special = "#$%&*()-_=+[]{}<>:?"
}
