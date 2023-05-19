import os
import requests

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from __init__ import create_app

from run import db, app

# app = Flask(__name__)
# CORS(app)

# # load .env variables
# load_dotenv()

# # app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///favorites.db'

# db_username = os.getenv('USERNAME')
# db_password = os.getenv('PASSWORD')
# db_url = os.getenv('DATABASE_URL')


# # app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_username}:{db_password}@localhost/favorite_clips' 
# app.config['SQLALCHEMY_DATABASE_URI'] = db_url



# db = SQLAlchemy(app)




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
        

client_id=os.getenv('CLIENT_ID')
client_secret=os.getenv('CLIENT_SECRET')

@app.route('/', methods=['GET'])
def test():
    return 'test'

def get_app_access_token(client_id, client_secret):
    url = 'https://id.twitch.tv/oauth2/token'
    data = {'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': 'client_credentials'}
    response = requests.post(url, data=data)
    access_token = response.json()['access_token']

    return access_token


@app.route('/get_user_tokens', methods=['GET'])
def get_user_tokens():
    code = request.args.get('code')
    
    url = 'https://id.twitch.tv/oauth2/token'
    data = {'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': "http://localhost:5000/authorize",
            'grant_type': 'authorization_code'}
    response = requests.post(url, data=data)
    tokens = response.json()
    
    return tokens

@app.route('/refresh_access_token', methods=['GET'])
def refresh_access_token():
    print("refreshing token")
    refresh_token = request.args.get('refresh_token')

    url = 'https://id.twitch.tv/oauth2/token'
    data = {'client_id': client_id,
            'client_secret': client_secret,
            'grant_type': "refresh_token",
            'refresh_token': refresh_token}
    response = requests.post(url, data=data)
    tokens = response.json()
    print(tokens)
    return tokens

app_access_token= get_app_access_token(client_id, client_secret)

headers = {'Client-ID': client_id, 'Authorization': f'Bearer {app_access_token}'}


    
@app.route('/get_user_info', methods=['GET'])
def get_user_info():
    access_token = request.args.get('access_token')

    url = 'https://api.twitch.tv/helix/users'

    headers = {'Authorization': f'Bearer {access_token}','Client-ID': client_id}
    
    response = requests.get(url, headers=headers)

    if(response):
        return response.json()['data'][0]
    
    #  expecting status code 401
    return response.json() 


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
    print(get_clip_info(clip_id))
    clip_info = get_clip_info(clip_id)['data'][0]
    creator_name = clip_info['creator_name']
    broadcaster_name = clip_info['broadcaster_name']
    # creator_info = get_user(creator_name, headers)
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
    # clips = Clips.query.filter_by(user_id=user_id).all()

    page = request.args.get('page', default=1, type=int)
    clips_per_page = request.args.get('clips_per_page', type=int)
    
    start_index = (page - 1) * clips_per_page
    end_index = start_index + clips_per_page


    clips = Clips.query.filter_by(user_id=user_id).order_by(Clips.id.desc()).slice(start_index, end_index).all()
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


@app.route('/favorite_clips/count/<user_id>', methods=['GET'])
def favorite_clip_count(user_id):
    clipCount = db.session.query(Clips).filter(Clips.user_id == user_id).count()
    return jsonify({'value': clipCount})


@app.route('/favorite_clips/search/count/<user_id>', methods=['GET'])
def search_favorite_clip_count(user_id):
    query = request.args.get('query')
    clipCount = db.session.query(Clips).filter((Clips.user_id == user_id) &
                                               Clips.clip_title.ilike(f'%{query}%') | 
                                               Clips.creator_name.ilike(f'%{query}%') | 
                                               Clips.broadcaster_name.ilike(f'%{query}%')).count()
    
    print ("clipCount new", clipCount)
    return jsonify({'value': clipCount})



@app.route('/favorite_clips/search', methods=['GET'])
def search_clips():
    
    query = request.args.get('query')
    user_id = request.args.get('user_id')
    page = request.args.get('page', default=1, type=int)
    clips_per_page = request.args.get('clips_per_page', type=int)
    
    start_index = (page - 1) * clips_per_page
    end_index = start_index + clips_per_page
    print("page", page)
    print("clips_per_page", clips_per_page)
    print("start_index", start_index)
    print("end_index", end_index)
    # clips = Clips.query.filter_by(user_id=user_id).order_by(Clips.id.desc()).slice(start_index, end_index).all()

    clips = Clips.query.filter(
        Clips.user_id == user_id,
        Clips.clip_title.ilike(f'%{query}%') | 
        Clips.creator_name.ilike(f'%{query}%') | 
        Clips.broadcaster_name.ilike(f'%{query}%')
    ).order_by(Clips.id.desc()).slice(start_index, end_index).all()
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
        
    print([clip['clip_title'] for clip in clip_list])
    return jsonify(clip_list)


@app.route('/client_id', methods=['GET'])
def get_client_id():
    
    return jsonify(client_id)

@app.route('/authorize', methods=['GET'])
def authorize():
    code = request.args.get('code')
    if(code):
        return "Logged in successfully. You can close this page."
    return "Something went wrong. Try again."


# create db
with app.app_context():
    db.create_all()




# if __name__ == '__main__':
#     app.run(host='twitch-favorite-clips-api.onrender.com', debug=True)
    

# flask --app bot  run --cert=cert.pem --key=key.pem