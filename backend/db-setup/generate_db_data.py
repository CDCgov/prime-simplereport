#!/usr/bin/python3

import sys
import csv
import argparse
import random
import faker
import importlib

def address(result):
    return [[oid, result['faker'].unique.address().replace('\n', ', ')]
            for oid in range(result['lines'])]

def city(result):
    return [[oid, result['faker'].unique.city()] for oid in range(result['lines'])]


def company(result):
    return [[oid, result['faker'].unique.company()] for oid in range(result['lines'])]

def email(result):
    return [[oid, result['faker'].unique.email()] for oid in range(result['lines'])]

def skylight_admin_email(result):
    emails = [""]
    # if emails is less than lines (which is the number of records in our database), add more emails
    # This is temporary, until we can pull emails from Okta
    if len(emails) < result['lines']:
        for i in range(result['lines'] - len(emails)):
            emails.append(emails[0] + str(i))
    return [[oid + 1, emails[oid]] for oid in range(result['lines'])]

def skylight_valid_organization_external_id(result):
    orgs = [""]
    # if orgs is less than lines (which is the number of records in our database), add more orgs
    # This is temporary, until we can pull orgs from Okta
    if len(orgs) < result['lines']:
        for i in range(result['lines'] - len(orgs)):
            orgs.append(orgs[0] + str(i))
    return [[oid + 1, orgs[oid]] for oid in range(result['lines'])]

def postcode(result):
    return [[oid, result['faker'].unique.postcode()] for oid in range(result['lines'])]

def main(args):
    generator_methods = [
        'skylight_admin_email', 'skylight_valid_organization_external_id',
        'address', 'city', 'company', 'email', 'postcode'
    ]
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--table',
        help='Type of data ({})'.format(generator_methods),
        choices=generator_methods,
        required=True
    )
    parser.add_argument(
        '--lines',
        help='Number of rows to add to the table',
        type=int,
        default=1000
    )
    parsed_args = parser.parse_args(args)
    requirements = dict();
    requirements['lines'] = parsed_args.lines
    requirements['faker'] = faker.Faker('en')
    write_csv(parsed_args, requirements)

def write_csv(args, requirements):
    for row in globals().get(args.table)(requirements):
        csv.writer(sys.stdout, delimiter='\t').writerow(row)

if __name__ == "__main__":
    main(sys.argv[1:])