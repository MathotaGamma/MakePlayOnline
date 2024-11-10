from flask import Flask, render_template, session, request, url_for, redirect, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect                                  
import threading
from flask_sqlalchemy import SQLAlchemy
import datetime
import pytz
import os
import json
import re
import pathlib
import textwrap
import google.generativeai as genai
import logging

"""from google.colab import userdata
from IPython.display import display
from IPython.display import Markdown"""



app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'mpginw.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Gamma'

# ロガーの設定
handler = logging.FileHandler('log.txt', encoding='utf-8')  # 出力先のファイルを指定
handler.setLevel(logging.INFO)  # ログレベルをINFOに設定
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)

# Flaskのロガーにハンドラを追加
app.logger.addHandler(handler)
app.logger.setLevel(logging.INFO)  # Flaskのログレベルを設定

socketio = SocketIO(app)

ver = "1.01.01";

db = SQLAlchemy(app)

created_date = datetime.datetime.now()

app.logger.info('作成日時:'+created_date.strftime('%Y-%m-%d=%H:%M:%S'))



class Post(db.Model):
  __tablename__ = 'info'
  name_db = db.Column(db.String(30), nullable=False)
  pass_db = db.Column(db.String(30), primary_key=True)
  id_db = db.Column(db.String(20), unique=True, primary_key=True)
  #created_day_db = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now(pytz.timezone('Asia/Tokyo')))
  created_day_db = db.Column(db.String(30), nullable=False)

  def __repr__(self):
    return f"<Post(name={self.name_db}, id={self.id_db})>"

class Chat(db.Model):
  __tablename__ = 'chats'

  id = db.Column(db.Integer, primary_key=True)  # 自動インクリメントのID
  chatroom = db.Column(db.String(50), nullable=False)  # チャットルーム名
  chatpass = db.Column(db.String(10), nullable=False)  # チャットルームのpass
  user_id = db.Column(db.String(20), nullable=False)  # ユーザーID
  message = db.Column(db.Text, nullable=False)  # チャットメッセージ
  timestamp = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now(pytz.timezone('Asia/Tokyo')))  # メッセージ送信時刻

  def __repr__(self):
    return f"<Chat(chatroom={self.chatroom}, user_id={self.user_id}, message={self.message})>"



def get_id(k_id):
  k_posts = Post.query.all()
  for k in k_posts:
    if k['id_db'] == k_id:
      return 


@app.errorhandler(Exception)
def handle_all_error(e):
  return render_template('/error.html',Error=e)

@app.route("/log")
def log():
  return render_template('log.txt')


@app.route("/sitemap.xml")
def sitemap():
  return app.send_static_file("sitemap.xml")


@app.route('/Notify/pushcode_sw.js',methods=['GET'])
@app.route('/Notify/pushcode_sw.js')
def Notify_pushcode_sw():
  return render_template('/Notify/pushcode_sw.js')

@app.route('/Notify/icon.png',methods=['GET'])
@app.route('/Notify/icon.png')
def Notify_icon():
  return render_template('/Notify/icon.png')


@app.route('/Notify/manifest.json',methods=['GET'])
@app.route('/Notify/manifest.json')
def Notify_manifest():
  return render_template('/Notify/manifest.json')


@app.route('/')
def homepage():
  return render_template('/homepage.html')

"""@app.route('/add', methods=['POST'])
def add():
	todo = request.form['todo']
	new_todo = ToDo(todo=todo)
	db.session.add(new_todo)
	db.session.commit()
	return redirect(url_for('index'))"""



@app.route('/Lifeshave/play')
def Lifeshave_play():
  return render_template('/LIFESHAVE/play.html')



@app.route('/gltf')
def gltf():
  return url_for('static',filename="LIFESHAVE/humancubist.gltf")

@app.route('/Static/<path:Path>',methods=['GET','POST'])
def Static_file_post(Path):
  return send_from_directory('static',Path)

@app.route('/Static/<path:Path>')
def Static_file(Path):
  return send_from_directory('static',Path)



@app.route('/Fighters/play')
def Fighters_play():
  return render_template('/Fighters/play.html')


@app.route('/Connect/Root')
def Connect_Root():
  return Root
  #return redirect(url_for('Connect_homepage'))


@app.route('/Connect/homepage')
def Connect_homepage():
  return render_template('/Connect/homepage.html')

@app.route('/Connect/sign', methods=['POST'])
def sign_post():
  # フォームデータからユーザー情報を取得

  # 新しいUserオブジェクトを作成
  users = Post.query.all()
  id_max = 0
  for k in users:
    id_max = max(id_max,int(k.id_db))


  now_str = datetime.datetime.now(pytz.timezone('Asia/Tokyo')).strftime('%Y-%m/%d-%H:%M:%S')

  user = Post(name_db=request.form['name'], pass_db=str(request.form['pass']), id_db=str(id_max+1),created_day_db=now_str)
  

  # データベースに保存
  db.session.add(user)
  db.session.commit()

  #return render_template('/Connect/home.html')
  return render_template('/Connect/login.html',name=request.form['name'], password=str(request.form['pass']), id=str(id_max+1), created_date=str(created_date))

@app.route('/Connect/sign')
def sign():
  return redirect(url_for('Connect_homepage'))

@app.route('/show')
def show():
  # すべてのUserレコードを取得
  users = Post.query.all()
  user_list = []
  for k in users:
    user_list.append([k.name_db,k.pass_db,k.id_db,k.created_day_db])

  chats = Chat.query.all()
  for k in chats:
    user_list.append(['chat',k.id,k.chatroom,k.chatpass,k.user_id,k.message,k.timestamp])

  # テンプレートにユーザー情報を渡す
  return render_template('/show.html', users=user_list)

@app.route('/Connect/home',methods=['POST','GET'])
def Connect_home_post():
  return render_template('/Connect/home.html',ver=ver,created_date=str(created_date))

@app.route('/Connect/home')
def Connect_home():
  return render_template('/Connect/home.html',ver=ver,created_date=str(created_date))

@app.route('/Connect/stay')
def Connect_stay():
  dir_path = "./templates/Connect/Root/"

  files_dir = ":".join([
    f for f in os.listdir(dir_path) if os.path.isdir(os.path.join(dir_path, f))
  ])
  return render_template('/Connect/stay.html',files_dir=files_dir)

@app.route('/base.html')
def base():
  return render_template('/base.html',created_date=created_date)

@app.route('/Connect/Root/<string:Space>/<path:Directly>')
def Connect_Root_ALL(Space,Directly):
  if(Space == "LIFESHAVE"):
    with open('static/LIFESHAVE/humancubist.gltf') as f:
      human = json.load(f)
    return render_template('/Connect/Root/{}/{}.html'.format(Space,Directly),human=human,ver=ver,created_date=str(created_date))
  else:
    return render_template('/Connect/Root/{}/{}.html'.format(Space,Directly),ver=ver,created_date=str(created_date))
"""@app.route('/Connect/Touch/home')
def Connect_Touch_home():
  return render_template('/Connect/Touch/home.html')

@app.route('/Connect/Pinball/home')
def Connect_Pinball_home():
  return render_template('/Connect/Pinball/home.html')



@app.route('/Connect/Morse/homepage')
def Connect_Morse_homepage():
  return render_template('/Connect/Morse/homepage.html')
"""







#クライアントとのコネクション確立
@socketio.on('connect')
def handle_connect():
  socketio.emit('client_echo',{'msg': 'server connected!'})


@socketio.on('cs_exist_room')
def exist_room(data):
  socketio.emit('sc_exist_room',data)

#LifeShaveのconnect時
@socketio.on('cs_room_connect')
def cs_room_connect(data):
  socketio.emit('sc_room_connect',data)


@socketio.on('cs_db_get')
def db_get(data):
  try:
    chats = Chat.query.all()
    print(f"Received cs_db_get request: {chats}")
    if data.get('kind') == 'list_get':
      k_list = []
      k_key = data.get('value')
      for k in chats:
        k_list.append(k[k_key])
      socketio.emit('sc_db_get',{'state':'success','id':data.get('id'),'kind':'list_get','value':",".join(k_list)})

    elif data.get('kind') == 'join_get': #参加しているグループを送信し、そのグループに参加している人を送る。
      k_str = ''
      k_id = data.get('id')
      k_num = 0
      for k in chats:
        if k['user_id'] == k_id:
	  if not k_num == 0:
	    k_str += ':'
	  k_num += 1
	  k_str += k['chatroom']+','+k['
    else:
      socketio.emit('sc_db_get',{'state':'failed','id':data.get('id'),'kind':data.get('kind'),'value':'not found:kind'})
  except Exception as k_e:
    socketio.emit('sc_db_get',{'state':'failed','id':data.get('id'),'kind':data.get('kind'),'value':'something error'})
  
  
  

@socketio.on('cs_signal')
def signal(data):
  #socketio.emit('sc_signal',data)
  if(data.get('path') == 'Chat'):
    chatroom = data.get('chatroom')
    chatpass = data.get('chatpass')
    user_id = data.get('id')
    message = data.get('message')

    # データベースに保存
    new_chat = Chat(chatroom=chatroom, user_id=user_id, message=message)
    db.session.add(new_chat)
    db.session.commit()
	
  socketio.emit('sc_signal',data)

@socketio.on('cs_join_lifeshave')
def join_lifeshave(data):
  socketio.emit('sc_join_lifeshave',data)

@socketio.on('cs_signal_lifeshave')
def signal_lifeshave(data):
  socketio.emit('sc_signal_lifeshave',data)



#Battle/stayの生存確認用
@socketio.on('cs_room_alive')
def cs_room_alive(data):
  socketio.emit('sc_room_alive',data)


#クライアントからのメッセージを出力する関数
@socketio.on('server_echo')
def handle_server_echo(msg):
  print('echo: ' + str(msg))

@socketio.on('first_fighters')
def first_fighters(msg):
  socketio.emit('to_first_fighters',msg)

@socketio.on('fighters_state')
def fighters_state(msg):
  socketio.emit('to_fighters_state',msg)
  #print(msg)

@socketio.on('finish_fighters')
def finish_fighters(msg):
  socketio.emit('to_finish_fighters',msg)
  #print(msg)

@socketio.on('cs_gemini_api')
def gemini_api(data):
  """def to_markdown(text):
    text = text.replace('•', '  *')
    return Markdown(textwrap.indent(text, '> ', predicate=lambda _: True))"""

  #socketio.emit('sc_gemini_api',data)

  genai.configure(api_key="AIzaSyBYTftYNc7eGvEUlJJlE4U2iVu8MQ2UQhM")
  # モデルを準備
  model = genai.GenerativeModel('gemini-pro')

  gemini_response = model.generate_content(data['text'])
  gen = gemini_response.text.replace('・','  *');
  #to_markdown(gemini_response.text)
  data['gen'] = gen
  socketio.emit('sc_gemini_api',data)



"""if __name__ == '__main__':
  db.create_all()
  #socketio.run(app,host="0.0.0.0", port="8088",allow_unsafe_werkzeug=True)
"""

def thread_func():
  with app.app_context():
    db.create_all()
  socketio.run(app,host="0.0.0.0", port="8088",allow_unsafe_werkzeug=True)
thread = threading.Thread(target=thread_func)
thread.start()
