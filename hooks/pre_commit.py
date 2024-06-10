import subprocess
import re
from tempfile import mkstemp
from shutil import move, copymode
from os import fdopen, remove
from uuid import uuid4

packages_source_path = 'packages_source/python/'

files_to_update = [
    'message/message/requirements.txt',
    'outcome/src/requirements.txt',
    'outcome/src/requirements_api.txt',
    'recipients/requirements.txt',
    'webapp/functions/python/requirements.txt',
    'webapp/cloudrun/admin/requirements.txt',
]

files_to_update_as_comments = [
    'recipients/requirements.txt',
    'outcome/src/requirements_api.txt'
]

git_diff = subprocess.check_output(['git', 'diff', '--cached', '--name-only'])


def replace(file_path, pattern, subst):
    fh, abs_path = mkstemp()
    with fdopen(fh, 'w') as new_file:
        with open(file_path) as old_file:
            for line in old_file:
                if re.search(packages_source_path, line):
                    new_file.write(subst)
                else:
                    new_file.write(line)
    copymode(file_path, abs_path)
    remove(file_path)
    move(abs_path, file_path)


if re.search(packages_source_path, git_diff.decode('utf-8').strip()):
    for file_name in files_to_update:
        comment = '# ' if file_name in files_to_update_as_comments else ''
        replace(file_name, packages_source_path, f'{comment}{packages_source_path} # {uuid4().hex}')
        subprocess.call(['git', 'add', file_name])
        print(f'Updated and added {file_name} to commit')
