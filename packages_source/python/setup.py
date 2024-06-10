""" setup.py """
from setuptools import find_namespace_packages, setup


setup(
    name='innbyggerkontakt_utils',
    version='1.0.4',
    packages=find_namespace_packages(include=['innbyggerkontakt.*']),
    install_requires=[
        'cryptography>=36.0.1',
        'firebase-admin>=5.2.0',
        'google-cloud-secret-manager>=2.12.4',
        'google-cloud-pubsub>=2.9.0',
        'google-cloud-storage>=1.43.0',
        'google-cloud-tasks>=2.10.2',
        'pydantic>=1.8.2',
        'pytz>=2022.2.1',
        'PyJWT>=2.3.0',
        'requests~=2.27',
    ],
    zip_safe=False,
)
