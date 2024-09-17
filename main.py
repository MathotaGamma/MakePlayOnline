from flask import Flask, render_template, session, request, url_for, redirect, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room, close_room, rooms, disconnect                                  
import threading
from flask_sqlalchemy import SQLAlchemy
import datetime
import pytz
import os
import json
import re
from PIL import Image
import sys
import subprocess
import jax.random
from diffusers import StableDiffusionPipeline,StableDiffusionImg2ImgPipeline, DPMSolverMultistepScheduler
import torch



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mpginw.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'Gamma'
socketio = SocketIO(app)

ver = "1.01.01";

db = SQLAlchemy(app)

created_date = datetime.datetime.now()

class Post(db.Model):
  name_db = db.Column(db.String(30), nullable=False)
  pass_db = db.Column(db.String(30), primary_key=True)
  id_db = db.Column(db.String(20), unique=True, primary_key=True)
  #created_day_db = db.Column(db.DateTime, nullable=False, default=datetime.datetime.now(pytz.timezone('Asia/Tokyo')))
  created_day_db = db.Column(db.String(30), nullable=False)


@app.errorhandler(Exception)
def handle_all_error(e):
  return render_template('/error.html',Error=e)


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

@app.route('/stable/home')
def stable():
  return render_template('/stable/home.html')

@app.route('/stable/play',methods=['POST'])
def stable_post():

	
  #　画像出力のディレクトリ

  # 画像のファイル名


  if 'install_pip' not in locals():
    #!pip install "jax[cuda12_pip==0.4.23]" -f https://storage.googleapis.com/jax-releases/jax_cuda_releases.html
    #subprocess.run(['pip','install','diffusers==0.11.1'])
    #!pip install transformers scipy ftfy
    #!pip install diffusers==0.11.1
    #subprocess.run(['pip','install','jax=0.4.23','jaxlib==0.4.23'])
    #!pip install jax==0.4.23 jaxlib==0.4.23
    #install_pip = True
  else:
    print('PIP was Installed')


  

  if "install_diffusers" in locals():
    print("diffusers was imported")
  else:
    print("diffusers is not imported")
    #subprocess.run(['pip','install','diffusers==0.8.0','transformers','scipy','ftfy'])
    #!pip install diffusers==0.8.0 transformers scipy ftfy
    #install_diffusers = True

  if "install_torch" in locals():
    print("torch was imported")
  else:
    print("torch is not imported")
	  
    #!pip install torch
    install_torch = True



  height_num = 640
  width_num = 360

  #model_id = "stablediffusionapi/anything-v5"
  model_id = "bluepen5805/blue_pencil-XL/"

  model_list = ['stablediffusionapi/anything-v5','Oscarguid/DivineEleganceMixV9','bluepen5805/blue_pencil-XL/']

  while True:
    #setting = input('Setting用(無入力でいい):')
    setting = request.form['setting']
    if setting == "":
      print('model_id:'+model_id)
      break
    if setting == "model_id":
      model_id = request.form['kind']
      pre_kind = ""

    if setting == "model_select":
      for k in range(len(model_list)):
        print(str(k)+':'+model_list[k])
      model_id = model_list[int(request.form['kind'])]


  prompt = request.form['prompt']
  n_prompt = request.form['n_prompt']
  strong = int(request.form['strong'])
  
  num = int(request.form['num'])
  image_num_onetime = int(request.form['onetime'])



  if 'pre_kind' not in locals():
    pre_kind = ''



  #model_id = 'Oscarguid/DivineEleganceMixV9'
  access_tokens = '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'

  if pre_kind != kind and kind == 'T':
    print('model is begun define')
    

    # アクセストークンの設定
    #access_tokens="" # @param {type:"string"}

    # モデルのインスタンス化
    # stablediffusionapi/anything-v5
    # Oscarguid/DivineEleganceMixV9
    # andite/pastel-mix
    #model_id = 'Oscarguid/DivineEleganceMixV9'



    model = StableDiffusionImg2ImgPipeline.from_pretrained(model_id, torch_dtype=torch.float16, use_auth_token=access_tokens, safety_checker=None)
    model.scheduler = DPMSolverMultistepScheduler.from_config(model.scheduler.config)
    model.to("cuda")
    print(model)
  elif pre_kind != 'F':
    print('model is begun define')
    
    model = StableDiffusionPipeline.from_pretrained(model_id, use_auth_token=access_tokens)
    model.to('cuda')


  pre_kind = kind





  filename = re.sub(r'[\\/:*?"<>|,]+', '', prompt).replace(' ','_')
  if len(filename) >= 20:
    filename = filename[0:19]
  try:
    try:
      os.mkdir('outputfile')
    except:
      pass
    os.mkdir('outputfile/'+filename)
  except:
    pass


  # 画像数
  #num

  def null_safety(images, **kwargs):
    #print('NSFW')
    return images, False


  try:
    model.safety_checker = null_safety
  except:
    print('error')


  image_return = []
  for i in range(num):
    # モデルにpromptを入力し画像生成
    print(str(i+1)+'枚目')
    if kind == 'T':
      #print(init_image)
      #print(model)
      #if not isinstance(model, StableDiffusionImg2ImgPipeline):
      #  print("Error: `model` is not of type `StableDiffusionImg2ImgPipeline`. Please make sure you have loaded the correct model.")
      """if "image" not in model.__call__.__kwdefaults__:
        print("Error: The `image` argument is missing from the `model` function. Please make sure you are using the correct version of the `diffusers` library.")
      """
      image = model(prompt,height=height_num,width=width_num,negative_prompt=n_prompt,init_image=init_image,strength=image_strength,num_inference_steps=strong-1,num_images_per_prompt=image_num_onetime)
    else:
      image = model(prompt,height=height_num,width=width_num,negative_prompt=n_prompt,num_inference_steps=strong-1,num_images_per_prompt=image_num_onetime)
    #print(image.keys())
    image_all = image['images']
    #print(str(len(image_all))+'枚')
    count = 0
    filename2 = f'_{i+1:02}_'
    try:
      os.mkdir(f"outputfile/{filename}/{filename2}")
    except:
      pass
    for k in image_all:
      count += 1
      image = k
    # 保存

      #image.save(f"outputfile/{filename}/{filename2}/_{count:02}_.png")
      image_return.append(image)

  return image_return



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
  return render_template('/Connect/login.html',name=request.form['name'], password=str(request.form['pass']), id=str(id_max+1))

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
  

  # テンプレートにユーザー情報を渡す
  return render_template('/show.html', users=user_list)

@app.route('/Connect/home',methods=['POST','GET'])
def Connect_home_post():
  return render_template('/Connect/home.html')

@app.route('/Connect/home')
def Connect_home():
  return render_template('/Connect/home.html')

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
    return render_template('/Connect/Root/{}/{}.html'.format(Space,Directly),human=human,ver=ver,created_date=created_date)
  else:
    return render_template('/Connect/Root/{}/{}.html'.format(Space,Directly),ver=ver,created_date=created_date)
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

@socketio.on('cs_signal')
def signal(data):
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
