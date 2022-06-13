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

def lorem_ipsum(result):
    return [[oid, result['faker'].unique.paragraph(nb_sentences=8)] for oid in range(result['lines'])]


def postcode(result):
    return [[oid, result['faker'].unique.postcode()] for oid in range(result['lines'])]

def main(args):
    generator_methods = [
        'street_name', 'address', 'city', 'company', 'country', 'email', 
        'first_name', 'iban', 'last_name', 'lorem_ipsum', 'postcode', 'siret'
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
    parser.add_argument(
        '--seed',
        help='Initializes the random generator'
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