import argparse
import json
import os

import firebase_admin
from firebase_admin import credentials, firestore


def build_parser():
    parser = argparse.ArgumentParser(description='Manage firestore')
    parser.add_argument(
        '-o', '--org', dest='org', type=str, help='ID på organisasjon data skal inn i'
    )
    parser.add_argument(
        '-c',
        '--collection',
        dest='collection',
        type=str,
        help='Angi firestore collection',
    )
    parser.add_argument(
        '-d',
        '--document',
        dest='document',
        type=str,
        help='ID på dokument som skal lastes opp',
    )
    parser.add_argument(
        '-f', '--file', dest='file', type=str, help='Fil med json-data for opplasting'
    )
    parser.add_argument(
        '--get', dest='get', action='store_true', help='Laste ned collection'
    )
    parser.add_argument('-D', '--delete', dest='delete', action='store_true')
    parser.add_argument('-a', '--all', dest='all', action='store_true')
    return parser


def parse_arguments():
    return build_parser().parse_args()


def print_usage():
    build_parser().print_help()


def delete_document(collection, document):
    coll = lookup_collection(collection)
    doc_ref = coll.document(document)
    doc_ref.delete()


def lookup_collection(collection):
    if organization:
        return organization.collection(collection)
    return db.collection(collection)


def clear_collection(collection):
    coll = lookup_collection(collection)
    # Delete all documents from collection
    for doc_snap in coll.get():
        doc_ref = coll.document(doc_snap.id)
        doc_ref.delete()


def print_collection_instance(collection, document, all):
    coll = lookup_collection(collection)
    doc_ref = coll.document(document)
    e = doc_ref.get()
    print('ID: ' + e.id)
    print(json.dumps(e.to_dict()))
    if all:
        for collection_ref in doc_ref.collections():
            print_collection(collection_ref.id)


def print_collection(collection):
    coll = lookup_collection(collection)
    for e in coll.get():
        print('ID: ' + e.id)
        print(json.dumps(e.to_dict()))
        print('--------------------------------------------')


def add_document_with_id(collection, document, data):
    coll = lookup_collection(collection)
    doc_ref = coll.document(document)
    doc_ref.set(data)


def add_document(collection, data):
    coll = lookup_collection(collection)
    coll.add(data)


def process_command():
    if args.delete and args.collection:
        if args.document:
            delete_document(args.collection, args.document)
        elif args.all:
            clear_collection(args.collection)
        else:
            print('Delete all must be confirmed with the --all flag')
    elif args.get and args.collection:
        if args.document:
            print_collection_instance(args.collection, args.document, args.all)
        else:
            print_collection(args.collection)
    elif args.file and args.collection:
        with open(args.file) as json_file:
            data = json.load(json_file)
            if args.document:
                add_document_with_id(args.collection, args.document, data)
            else:
                add_document(args.collection, data)
    else:
        print_usage()


def connect_db():
    project_id = os.getenv('GCLOUD_PROJECT')
    cred = credentials.ApplicationDefault()
    firebase_admin.initialize_app(
        cred,
        {
            'projectId': project_id,
        },
    )
    return firestore.client()


def set_parent_collection():
    if args.org:
        coll = db.collection('organization')
        return coll.document(args.org)
    else:
        return None


db = connect_db()
organization = None
# Main program
if __name__ == '__main__':
    args = parse_arguments()
    organization = set_parent_collection()
    process_command()
    print('Done')
