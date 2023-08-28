from flask_sqlalchemy import SQLAlchemy
from config import metadata

db = SQLAlchemy(metadata=metadata)