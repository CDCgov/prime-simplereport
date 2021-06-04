locals {
  schema_name = "public"

  grant_command = <<EOF
  psql \
  --host ${azurerm_postgresql_server.db.fqdn} \
  --username ${var.administrator_login}@${azurerm_postgresql_server.db.name} \
  --dbname "${var.db_table}" \
  --command "DO \$\$ BEGIN CREATE ROLE ${azurerm_key_vault_secret.db_username_no_phi.value} WITH LOGIN NOSUPERUSER ENCRYPTED PASSWORD '${var.nophi_user_password}'; EXCEPTION WHEN DUPLICATE_OBJECT THEN RAISE NOTICE 'not creating ${azurerm_key_vault_secret.db_username_no_phi.value} role -- it already exists'; END \$\$;"
  EOF
}

### The following resource opens the DB firewall for the Github Action runner's IP, adds the simple_report_no_phi user, and then closes the firewall and removes access for that IP.
### NOTE: these resources will only trigger if local.grant_command has changed, due to how slowly each CLI operation runs. It's fine to run every single time if we're worried about state divergence.

resource "null_resource" "add_no_phi_user" {
  triggers = {
    grant_command = local.grant_command
  }

  provisioner "local-exec" {
    command    = <<EOT
      RUNNER_PUBLIC_IP=$(curl -s ipinfo.io/ip);
      az postgres server update --public enabled --name ${azurerm_postgresql_server.db.name} --resource-group ${var.rg_name};
      az postgres server firewall-rule create --name runner-ip --server-name ${azurerm_postgresql_server.db.name} --resource-group ${var.rg_name} --start-ip-address $RUNNER_PUBLIC_IP --end-ip-address $RUNNER_PUBLIC_IP;
      ${local.grant_command}
      az postgres server firewall-rule delete --name runner-ip --server-name ${azurerm_postgresql_server.db.name} --resource-group ${var.rg_name} --yes;
      az postgres server update --public disabled --name ${azurerm_postgresql_server.db.name} --resource-group ${var.rg_name};
    EOT
    on_failure = fail

    environment = {
      PGPASSWORD = data.azurerm_key_vault_secret.db_password.value
    }
  }

  depends_on = [
    azurerm_postgresql_server.db
  ]
}
