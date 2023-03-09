import os
import requests
from twitchio.ext import commands

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv


app = Flask(__name__)
CORS(app)

# load .env variables
load_dotenv()

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///favorites.db'

db_username = os.getenv('USERNAME')
db_password = os.getenv('PASSWORD')
app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_username}:{db_password}@localhost/favorite_clips'

# app.config['SECRET_KEY'] = "test123"

db = SQLAlchemy(app)


class Clips(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    clip_id = db.Column(db.String, nullable=False)
    user_id = db.Column(db.String, nullable=False)

    creator_name = db.Column(db.String, nullable=False)
    broadcaster_name = db.Column(db.String, nullable=False)
    # creator_info = db.Column(db.String, nullable=False)
    clip_title = db.Column(db.String, nullable=False)
    clip_duration = db.Column(db.Integer, nullable=False)
    thumbnail_url = db.Column(db.String, nullable=False)
    created_at = db.Column(db.String, nullable=False)
    clip_url = db.Column(db.String, nullable=False)

    def __init__(self, clip_id, user_id, creator_name, broadcaster_name, clip_title, clip_duration, thumbnail_url, created_at, clip_url):
        self.clip_id = clip_id
        self.user_id = user_id
        self.creator_name = creator_name
        self.broadcaster_name = broadcaster_name
        self.clip_title = clip_title
        self.clip_duration = clip_duration
        self.thumbnail_url = thumbnail_url
        self.created_at = created_at
        self.clip_url = clip_url
        
    
# bot = commands.Bot(
#     token=os.environ['CLIENT_SECRET'],
#     client_id=os.environ['CLIENT_ID'],
#     nick=os.environ['BOT_NICKNAME'],
#     prefix=os.environ['BOT_PREFIX'],
#     channel=os.environ['CHANNEL'],

# )

client_id=os.getenv('CLIENT_ID')
client_secret=os.getenv('CLIENT_SECRET')


def get_app_access_token(client_id, client_secret):
    url = 'https://id.twitch.tv/oauth2/token'
    data = {'client_id': client_id,
            'client_secret': client_secret,
            # 'redirect_uri': 'client_credentials',
            'grant_type': 'client_credentials'}
    response = requests.post(url, data=data)
    access_token = response.json()['access_token']

    return access_token

def get_user_access_token(client_id, client_secret):
    url = 'https://id.twitch.tv/oauth2/token'
    data = {'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': 'client_credentials',
            'grant_type': 'client_credentials'}
    response = requests.post(url, data=data)
    access_token = response.json()['access_token']

    return access_token

access_token= get_app_access_token(client_id, client_secret)




# params = {'login': 'zycieszymona'}
# params = {'login': 'Lightt__'}

# Dodanie nagłówka z kluczem dostępu
headers = {'Client-ID': client_id, 'Authorization': f'Bearer {access_token}'}


    

def get_user(user_name, headers):
    url = 'https://api.twitch.tv/helix/users'
    params = {'login': user_name}
    response = requests.get(url, params=params, headers=headers)

    return response.json()

# user = get_user("mamm0n", headers)
# user_id = user['data'][0]['id']

def get_clip_info(clip_id):
    url = 'https://api.twitch.tv/helix/clips?id=' + clip_id
    # headers = {'Client-ID': client_id}
    response = requests.get(url, headers=headers)
    data = response.json()
    return data

@app.route('/add_clip_to_favorites', methods=['POST'])
def add_clip_to_favorites():
    
    user_id = request.args.get('user_id')
    clip_id = request.args.get('clip_id')
    
    existing_clip = Clips.query.filter_by(clip_id=clip_id, user_id=user_id).first()
    if existing_clip:
        return jsonify({'error': 'Clip already in favorites.'}), 400

    clip_info = get_clip_info(clip_id)['data'][0]
    creator_name = clip_info['creator_name']
    broadcaster_name = clip_info['broadcaster_name']
    creator_info = get_user(creator_name, headers)
    clip_title = clip_info['title']
    clip_duration = clip_info['duration']
    thumbnail_url = clip_info['thumbnail_url']
    created_at = clip_info['created_at']
    clip_url = clip_info['url']

    # user_name = user_info['data'][0]['display_name']
    print("clip_info", clip_info)

    clip = Clips(clip_id, user_id, creator_name, broadcaster_name, clip_title, clip_duration, thumbnail_url, created_at, clip_url)
    db.session.add(clip)
    db.session.commit()
    return jsonify({'success': True})

    return clip_info

@app.route('/remove_clip_from_favorites', methods=['DELETE'])
def remove_clip_from_favorites():

    user_id = request.args.get('user_id')
    clip_id = request.args.get('clip_id')

    clip = Clips.query.filter_by(user_id=user_id, clip_id=clip_id).first()

    if clip:
        db.session.delete(clip)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Clip removed from favorites.'}), 200
    else:
        return jsonify({'success': False, 'message': 'Clip not found in favorites.'}), 404



@app.route('/favorite_clips/<user_id>', methods=['GET'])
def get_favorite_clips(user_id):
    clips = Clips.query.filter_by(user_id=user_id).all()

    clip_list = []
    for clip in clips:
        clip_dict = {
            'clip_id': clip.clip_id,
            'user_id': clip.user_id,
            'creator_name': clip.creator_name,
            'broadcaster_name': clip.broadcaster_name,
            'clip_title': clip.clip_title,
            'clip_duration': clip.clip_duration,
            'thumbnail_url': clip.thumbnail_url,
            'created_at': clip.created_at,
            'clip_url': clip.clip_url,
        }
        clip_list.append(clip_dict)
    
    return jsonify(clip_list)

@app.route('/is_user_clip_in_favorites', methods=['GET'])
def is_user_clip_in_favorites():

    user_id = request.args.get('user_id')
    clip_id = request.args.get('clip_id')

    clip = Clips.query.filter_by(user_id=user_id, clip_id=clip_id).first()

    if clip:
       return jsonify({'result': True})
    else:
        return jsonify({'result': False})

# save_clip_to_favorites('StylishAmericanSmoothieBrokeBack-9ceFj_Vx5GtSeC_c')



# create db
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)

