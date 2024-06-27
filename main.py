from flask import Flask, render_template, session, request ,url_for        
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect                                  
import threading
from flask_sqlalchemy import SQLAlchemy
import datetime
import pytz


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mpginw.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Gamma'
socketio = SocketIO(app)

db = SQLAlchemy(app)

class Post(db.Model):
  name = db.Column(db.String(30), nullable=False)
  id = db.Column(db.Integer, unique=True, primary_key=True)
  created_day = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now(pytz.timezone('Asia/Tokyo')))


@app.errorhandler(Exception)
def handle_all_error(e):
  return render_template('/error.html',Error=e)


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

@app.route('/add', methods=['POST'])
def add():
  # フォームデータからユーザー情報を取得

  # 新しいUserオブジェクトを作成
  user = post(name=request.form['todo'], id=1)

  # データベースに保存
  db.session.add(user)
  db.session.commit()

  return redirect(url_for('show'))

@app.route('/show')
def show():
  # すべてのUserレコードを取得
  users = Post.query.all()

  # テンプレートにユーザー情報を渡す
  return render_template('/show.html', users=users)

@app.route('/Lifeshave/play')
def Lifeshave_play():
  return render_template('/LIFESHAVE/play.html')

@app.route('/gltf')
def gltf():
  return url_for('static',filename="LIFESHAVE/humancubist.gltf")

@app.route('/Fighters/play')
def Fighters_play():
  return render_template('/Fighters/play.html')

@app.route('/Battle/homepage')
def Battle_homepage():
  return render_template('/Battle/homepage.html')

@app.route('/Battle/home',methods=['POST','GET'])
def Battle_home_post():
  return render_template('/Battle/home.html')

@app.route('/Battle/home')
def Battle_home():
  return render_template('/Battle/home.html')

@app.route('/Battle/stay')
def Battle_stay():
  return render_template('/Battle/stay.html')

@app.route('/Battle/Touch/home')
def Battle_Touch_home():
  return render_template('/Battle/Touch/home.html')

@app.route('/Battle/Pinball/home')
def Battle_Pinball_home():
  return render_template('/Battle/Pinball/home.html')


#クライアントとのコネクション確立
@socketio.on('connect')
def handle_connect():
  socketio.emit('client_echo',{'msg': 'server connected!'})


#Battle/stayのconnect時
@socketio.on('cs_room_connect')
def cs_room_connect(data):
  socketio.emit('sc_room_connect',data)


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
