from __init__ import create_app

if __name__ == '__main__':
    app, db = create_app()
    app.run(host='twitch-favorite-clips-api.onrender.com')