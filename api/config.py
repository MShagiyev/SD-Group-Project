from os import environ, path
from dotenv import load_dotenv

basedir = path.abspath(path.dirname(__file__))
load_dotenv(path.join(basedir, '.env'))

# General Config
SECRET_KEY = environ.get('SECRET_KEY')
FLASK_APP = environ.get('FLASK_APP')
FLASK_ENV = environ.get('FLASK_ENV')
WTF_CSRF_ENABLED = False

# JWT Config
JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')
JWT_ACCESS_TOKEN_EXPIRES = 3600

# Database
SQLALCHEMY_DATABASE_URI = 'mysql://' + environ.get("SQLALCHEMY_DATABASE_URI")
SQLALCHEMY_ECHO = True
SQLALCHEMY_TRACK_MODIFICATIONS = True