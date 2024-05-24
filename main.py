from flask import Flask, render_template, session, request ,url_for        
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect                                  
import threading




app = Flask(__name__)
app.config['SECRET_KEY'] = 'Gamma'
socketio = SocketIO(app)




@app.route('/')
def homepage():
  return render_template('/homepage.html')

@app.route('/Lifeshave/play')
def Lifeshave_play():
  return render_template('/LIFESHAVE/play.html')

@app.route('/gltf')
def gltf():
  return url_for('static',filename="LIFESHAVE/humancubist.gltf")

@app.route('/Fighters/play')
def Fighters_play():
  return render_template('/Fighters/play.html')


#クライアントとのコネクション確立
@socketio.on('connect')
def handle_connect():
    emit('client_echo',{'msg': 'server connected!'})


#クライアントからのメッセージを出力する関数
@socketio.on('server_echo')
def handle_server_echo(msg):
    print('echo: ' + str(msg))

@socketio.on('first_fighters')
def first_fighters(msg):
  emit('to_first_fighters',msg)

@socketio.on('fighters_state')
def fighters_state(msg):
  emit('to_fighters_state',msg)
  print(msg)

@socketio.on('finish_fighters')
def finish_fighters(msg):
  emit('to_finish_fighters',msg)
  print(msg)



def thread_func():
  socketio.run(app,host="0.0.0.0", port="8088",allow_unsafe_werkzeug=True)
thread = threading.Thread(target=thread_func)
thread.start()
