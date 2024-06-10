import os
import zipfile
import fnmatch
from terraform_external_data import terraform_external_data
from hashlib import md5
from pathlib import Path
import deterministic_zip

packages_source_path = '../packages_source'


def zipdir(path, ziph, exclude=[], add_in_folder=''):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.join(add_in_folder, os.path.relpath(file_path, path))
            if any(fnmatch.fnmatch(relative_path, pattern) for pattern in exclude):
                continue
            deterministic_zip.add_file(ziph, file_path, zip_path=relative_path)


@terraform_external_data
def main(query):
    Path(os.path.dirname(query['destination'])).mkdir(parents=True, exist_ok=True)
    zipf = zipfile.ZipFile(query['destination'], 'w', zipfile.ZIP_DEFLATED)
    zipdir(query['location'], zipf, exclude=list(query.get('exclude', '').split(' ')))
    if bool(query.get('include_packages_source')):
        zipdir(packages_source_path, zipf, exclude=list(query.get('exclude', '').split(' ')),
               add_in_folder=query.get('add_in_folder'))
    zipf.close()
    with open(query['destination'], "rb") as f:
        bytes = f.read()
        md5_hash = md5(bytes).hexdigest()
    return {'destination': query['destination'], 'output_md5': md5_hash}


if __name__ == '__main__':
    main()
