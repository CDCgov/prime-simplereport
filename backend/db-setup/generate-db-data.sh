#!/bin/sh

set -e

# TODO: determine what data we feel a need to generate more of

# This is an example of how to generate data with out generate_db_data.py script
docker compose exec db python3 generate_db_data.py --table address --lines 500
docker compose exec db python3 generate_db_data.py --table city --lines 500
docker compose exec db python3 generate_db_data.py --table company --lines 500
docker compose exec db python3 generate_db_data.py --table email --lines 500
docker compose exec db python3 generate_db_data.py --table lorem_ipsum --lines 500
docker compose exec db python3 generate_db_data.py --table postcode --lines 500
