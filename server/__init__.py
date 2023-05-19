# import os
# from flask import Flask
# from flask_cors import CORS
# from dotenv import load_dotenv
# from flask_sqlalchemy import SQLAlchemy

# def create_app():
#     app = Flask(__name__)
#     CORS(app)
#     load_dotenv()
#     db_url = os.getenv('DATABASE_URL')
#     app.config['SQLALCHEMY_DATABASE_URI'] = db_url

#     db = SQLAlchemy(app)

#     with app.app_context():
#         db.create_all()
    
#     return app, db