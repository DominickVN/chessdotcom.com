from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData

SQLALCHEMY_DATABASE_URI = 'sqlite:////home/dominick/Flatiron/code/5-phase/project/final-project/server/instance/app.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

metadata = MetaData(naming_convention={
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
})