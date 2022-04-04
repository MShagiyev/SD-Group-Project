from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Create DB instance
db = SQLAlchemy()

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    # config from a python file all pertitnent env variables 
    app.config.from_pyfile('config.py')
    JWTManager(app)
    db.init_app(app)
    with app.app_context():
        from . import server
        # allow cross origin requests to be received 
        CORS(app)
        # db.drop_all()
        # db.create_all() # Create sql tables for our data models
        return app