"""Make requests with digdir authentication"""
import requests

from innbyggerkontakt.digdir.auth import Auth


class AuthRequest:
    # pylint: disable=too-few-public-methods
    """ auth: innbyggerkonktat.digdir.auth.Auth
        not_authorized_status_code: int=401 """

    def __init__(self, auth: Auth, not_authorized_status_code=401):
        self.auth = auth
        self.access_token = auth.get_access_token()
        self.not_authorized_status_code = not_authorized_status_code

    def request(self, url: str, data: dict = None, headers: dict = {},  # pylint: disable=dangerous-default-value
                params: dict = None, retry=False) -> requests.Response:
        """ Make POST request if data is included, else make GET request
            url: str
            data: dict - POST request data
            headers: dict
            params: dict
            retry: bool=False, will get new access token and retry if request if True
        """

        headers['Authorization'] = f'Bearer {self.access_token}'
        if data:
            response = requests.post(url, json=data, headers=headers, params=params)
        else:
            response = requests.get(url, headers=headers, params=params)

        if response.status_code == self.not_authorized_status_code and not retry:
            self.access_token = self.auth.get_access_token()
            response = self.request(url, data, headers=headers, params=params, retry=True)
        return response

    def request_get(self, url: str, headers: dict = {},  # pylint: disable=dangerous-default-value
                    params: dict = None, retry=False) -> requests.Response:
        """Make GET request with digdir auth header"""
        headers['Authorization'] = f'Bearer {self.access_token}'
        response = requests.get(url, headers=headers, params=params)

        if response.status_code == self.not_authorized_status_code and not retry:
            self.access_token = self.auth.get_access_token()
            response = self.request_get(url, headers=headers, params=params, retry=True)
        return response

    def request_post(self, url: str, *, json: dict, headers: dict = {},  # pylint: disable=dangerous-default-value
                     params: dict = None, retry=False) -> requests.Response:
        """ Make POST request if data is included, else make GET request
            url: str
            data: dict - POST request data
            headers: dict
            params: dict
            retry: bool=False, will get new access token and retry if request if True
        """

        headers['Authorization'] = f'Bearer {self.access_token}'
        response = requests.post(url, json=json, headers=headers, params=params)

        if response.status_code == self.not_authorized_status_code and not retry:
            self.access_token = self.auth.get_access_token()
            response = self.request_post(url, json=json, headers=headers, params=params, retry=True)
        return response
