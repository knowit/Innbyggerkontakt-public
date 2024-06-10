"""conftest.py is where we can write hooks for pytest."""
from typing import List

import pytest
import yaml
from pytest import MonkeyPatch


def pytest_addoption(parser: pytest.Parser):
    """Register argparse-style options and ini-style config values, called once at the beginning of a test run."""
    parser.addoption(
        '--run-integration',
        action='store_true',
        default=False,
        help='run integration tests',
    )


def pytest_configure(config: pytest.Config):
    """Run before pytest after args have been parsed."""
    config.addinivalue_line(
        'markers', 'integration_test: mark test as integration test'
    )


def pytest_collection_modifyitems(config: pytest.Config, items: List[pytest.Item]):
    """Run after collection of pytest files has been performed."""
    if config.getoption('--run-integration'):
        # --runintegration given in cli: do not skip integration tests
        return
    skip_integration = pytest.mark.skip(reason='need --run-integration option to run')
    for item in items:
        if 'integration_test' in item.keywords:
            item.add_marker(skip_integration)


@pytest.fixture(scope='function', autouse=True)
def set_env_variables(monkeypatch: MonkeyPatch):
    """Open environments.yml and set them as environ-vars."""
    with open('../config/environments.yml', 'r', encoding='utf-8') as config_file:
        environments = yaml.safe_load(config_file)
    for key, value in environments['innbyggerkontakt-dev'].items():
        #  os.environ[str.upper(key)] = value
        monkeypatch.setenv(name=str.upper(key), value=value)
    monkeypatch.setenv(name='NIDS_BUCKET', value='sms-nids')
    monkeypatch.setenv(name='GCP_PROJECT', value='innbyggerkontakt-dev')
    monkeypatch.setenv(
        name='START_BATCH_TOPIC', value='freg-batch-getter-function-topic'
    )
    monkeypatch.setenv(
        name='START_KRR_TOPIC', value='get-phone-numbers-from-krr-function-topic'
    )
