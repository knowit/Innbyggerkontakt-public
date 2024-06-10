"""Setup for pytest ref."""

import os


os.environ['KRR_ENDPOINT'] = 'https://test-krr.no'
os.environ['KRR_SCOPE'] = 'krr:global/kontaktinformasjon.read'
os.environ['MASKINPORTEN_ENDPOINT'] = 'https://test.maskinporten.no'
