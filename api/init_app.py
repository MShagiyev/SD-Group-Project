from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager


# Create DB instance
db = SQLAlchemy()

def create_app(test_config=None): #optional testing config that i could setup if i wanted
    app = Flask(__name__, instance_relative_config=False)
    # config from a python file all pertitnent env variables
    app.config.from_pyfile('config.py')
    JWTManager(app)
    db.init_app(app)
    with app.app_context():
        import server
        # allow cross origin requests to be received 
        CORS(app)
        return app