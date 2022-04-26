import unittest
import flask_unittest
import secrets
import string
from init_app import create_app
from unittest.mock import patch

class TestApp(flask_unittest.ClientTestCase):
    app = create_app()
    test_email = "".join(secrets.choice(string.ascii_letters + string.digits) for i in range(6)) + "@gmail.com"
    test_route = 'http://127.0.0.1:5000'

    registerTest = {
        "email": test_email,
        "password": "123"
    }

    loginTest = {
        "email": "xdCXSm@gmail.com",
        "password": "123"
    }
    invalidLogin = {
        "email": "abcd",
        "password": ""
    }

    profileTest = {
        "id": "xdCXSm@gmail.com",
        "fullName": "Eric Goldeater",
        "add1": "123 Bay Street",
        "add2": "",
        "state": "CA",
        "city": "Weston",
        "zipCode": 66876
    }
    allInvalidProfileTest = {
        "id": "xdCXSm@gmail.com",
        "fullName": "123",
        "add1": "Babnea",
        "add2": "",
        "state": "Nowhere",
        "city": "1234",
        "zipCode": 211234122323
    }

    quoteTest = {
        "id": "xdCXSm@gmail.com",
        "gallons": 30,
        "total": 25.7,
        "suggested": 1.73,
        "date": "Sun Jun 5 2022"
    }
    allInvalidQuoteTest = {
        "id": "xdCXSm@gmail.com",
        "gallons": "-2abcd0",
        "total": 0,
        "suggested": 0,
        "date": "Sun Jun 5 1930"
    }
    
    # test general functionality and all routes work expectedly
    def test_registration(self, client):
        res = client.post(f'{self.test_route}/register', data=self.registerTest)
        self.assertEqual(res.status_code, 200)

    def test_login(self, client):
        res = client.post(f'{self.test_route}/login', data=self.loginTest)
        self.assertEqual(res.status_code, 200)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_profile(self, client, mock_jwt_required):
        res = client.post(f'{self.test_route}/profile', data=self.profileTest)
        self.assertEqual(res.status_code, 200)
    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_quote(self, client, mock_jwt_required):
        res = client.post(f'{self.test_route}/quote', data=self.quoteTest)
        self.assertEqual(res.status_code, 200)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_history(self, client, mock_jwt_required):
        res = client.get(f'{self.test_route}/get-history?id=xdCXSm@gmail.com')
        self.assertEquals(res.status_code, 200)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_profile_fetch(self, client, mock_jwt_required):
        res = client.get(f'{self.test_route}/get_profile?id=xdCXSm@gmail.com')
        self.assertEquals(res.status_code, 200)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_quote_fetch(self, client, mock_jwt_required):
        res = client.get(f'{self.test_route}/get_quote?id=xdCXSm@gmail.com&galls=33')
        self.assertEquals(res.status_code, 200)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_quote_details_fetch(self, client, mock_jwt_required):
        res = client.get(f'{self.test_route}/get_quote_details?id=xdCXSm@gmail.com')
        self.assertEquals(res.status_code, 200)

    

    def test_invalid_login(self, client):
        res = client.post(f'{self.test_route}/login', data=self.invalidLogin)
        self.assertEquals(res.status_code, 400)

    def test_already_registered(self, client):
        res = client.post(f'{self.test_route}/register', data=self.loginTest)
        self.assertEqual(res.status_code, 400)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_all_invalid_profile_inputs(self, client, mock_jwt_required):
        res = client.post(f'{self.test_route}/profile', data=self.allInvalidProfileTest)
        self.assertEqual(res.status_code, 400)

    @patch('flask_jwt_extended.view_decorators.verify_jwt_in_request')
    def test_all_invalid_quote_inputs(self, client, mock_jwt_required):
        res = client.post(f'{self.test_route}/quote', data=self.allInvalidQuoteTest)
        self.assertEqual(res.status_code, 400)
