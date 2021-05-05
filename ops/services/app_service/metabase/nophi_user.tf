locals {
  schema_name = "public"

  grant_command = <<EOF
  psql \
  --host ${var.postgres_server_fqdn} \
  --username ${var.postgres_admin_username}@${var.postgres_server_name} \
  --dbname "metabase" \
  --command "GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${var.postgres_metabase_username}; GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO ${var.postgres_metabase_username};"
  EOF
}

### The following resource opens the DB firewall for the Github Action runner's IP, adds Metabase permissions for the simple_report_no_phi user, and then closes the firewall and removes access for that IP.
### NOTE: these resources will only trigger if local.grant_command has changed, due to how slowly each CLI operation runs. It's fine to run every single time if we're worried about state divergence.

resource "null_resource" "add_metabase_permissions_for_no_phi_user" {
  triggers = {
    grant_command = local.grant_command
  }

  provisioner "local-exec" {
    command    = <<EOT
      RUNNER_PUBLIC_IP=$(curl -s ipinfo.io/ip);
      az postgres server update --public enabled --name ${var.postgres_server_name} --resource-group ${var.resource_group_name};
      az postgres server firewall-rule create --name runner-ip --server-name ${var.postgres_server_name} --resource-group ${var.resource_group_name} --start-ip-address $RUNNER_PUBLIC_IP --end-ip-address $RUNNER_PUBLIC_IP;
      ${local.grant_command}
      az postgres server firewall-rule delete --name runner-ip --server-name ${var.postgres_server_name} --resource-group ${var.resource_group_name} --yes;
      az postgres server update --public disabled --name ${var.postgres_server_name} --resource-group ${var.resource_group_name};
    EOT
    on_failure = fail

    environment = {
      PGPASSWORD = var.postgres_admin_password
    }
  }

  depends_on = [
    azurerm_postgresql_database.metabase
  ]
}
