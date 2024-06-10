from shutil import copy
import subprocess

print(copy('pre-commit.script', '../.git/hooks/pre-commit'))
command = 'chmod +x ../.git/hooks/pre-commit'
process = subprocess.Popen(command.split(), stdout=subprocess.PIPE)
output, error = process.communicate()
