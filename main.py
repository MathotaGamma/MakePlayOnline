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

def thread_func():
  socketio.run(app,host="0.0.0.0", port="8088")
thread = threading.Thread(target=thread_func)
thread.start()