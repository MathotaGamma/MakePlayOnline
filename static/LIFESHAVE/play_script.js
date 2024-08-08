//localStorageのkeyを変更して使って

alert('ver:2');

import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";

addEventListener("error", (event) => {
  alert(event)
})

let Text = "";
let Text_id = document.getElementById('text');



//1:開始前(待機中),2:Game中,3:死亡中,4:終了時
let state = 1;

let state_2_time = 0;

let state_once = true;

let game_tf = false;

//ragの時間(わざと遅らせる分)
let rag = 0.05;


let touch_l = []
let touch_num = 0;
let touch_start = [];

let theta_first = [];
let theta_first_tf = true;

let move_ind = -1;

//自分が所持しているデータ(表示されない)
let pre_Value = {};
//通信した後のデータ(表示するデータ)
//position:[meのx,y,x座標],theta:[視点の横回転,縦回転],camera_add_position:[meのpos+bet+α分のx,y,z]
let Value = {"0":{position:[0,0,0],theta:[0,0],camera_add_position:[0,0,0]}};

let ori_stay_Value = [];
let stay_Value = [];
//現在のValueの更新時間(ragを考慮した時間)(idで保存)
let stay_time = {};
let arrive_list = {};

function getUrlQueries() {
  let queryStr = window.location.search.slice(1);  // 文頭?を除外
  let queries = {};

  // クエリがない場合は空のオブジェクトを返す
  if (!queryStr) {
    return queries;
  }

  // クエリ文字列を & で分割して処理
  queryStr.split('&').forEach(function(queryStr) {
    // = で分割してkey,valueをオブジェクトに格納
    let queryArr = queryStr.split('=');
    queries[queryArr[0]] = queryArr[1];
  });

  return queries;
}


let max_num = 0;
let num = 0;
if(Object.keys(getUrlQueries()).includes('num')){
  max_num = parseInt(getUrlQueries().num);
} else {
  alert('Errorが発生しました。No.003')
  window.location.href = "./home";
}
//console.log(max_num)

let id = localStorage.getItem('id');
let room = localStorage.getItem('room');


if(room == null){
  alert('Errorが発生しました。No.002')
  window.location.href = "/";
} else {
  room = Number(room);
}

let name = localStorage.getItem('name')


//socketオブジェクト生成
let socket = io();
//サーバとのコネクション確立
socket.on('sc_connect', function(data) {
  alert(data.msg)
  //socket.emit('server_echo', {data: 'client connected!'});
});


socket.emit('cs_join_lifeshave',{id:id,room:room,name:name})
//サーバからのメッセージを出力する関数
socket.on('sc_join_lifeshave', function(data) {
  if(data.room == room && data.id != id){
    alert('join:'+data.name)
  }
});

socket.on('sc_signal_lifeshave',function (data) {
  //alert(data)
  if(data != undefined){
    ori_stay_Value = ori_stay_Value.concat([{'time':data.time,'id':data.id,'value':data.value}]);
    Text = String(ori_stay_Value.length);
  }
  
})

addEventListener("touchstart",(e) => {
  // タッチ点の数に応じて適切なハンドラーを呼び出す
  
  touch_num = e.touches.length;
  //配列の中に連想配列が入ってる
  touch_l = Array.from({length: touch_num}, (k, k1) => k1).map(k2 => [e.touches[k2].clientX,e.touches[k2]])
  //配列の中に連想配列が入ってる
  touch_start = Array.from({length: touch_num}, (k, k1) => k1).map(k2 => [e.touches[k2].clientX,e.touches[k2]])
    
},false,);
addEventListener("touchmove",(e) => {
  // タッチ点の数に応じて適切なハンドラーを呼び出す
  touch_num = e.touches.length;
  touch_l = Array.from({length: touch_num}, (k, k1) => k1).map(k2 => [e.touches[k2].clientX,e.touches[k2]])

},false,);
addEventListener("touchend",(e) => {
  // タッチ点の数に応じて適切なハンドラーを呼び出す
  touch_num = e.touches.length;
  touch_l = Array.from({length: touch_num}, (k, k1) => k1).map(k2 => [e.touches[k2].clientX,e.touches[k2]])
  touch_start = Array.from({length: touch_num}, (k, k1) => k1).map(k2 => [e.touches[k2].clientX,e.touches[k2]])
  
  
},false,);

// サイズを指定
const width = window.innerWidth;
const height = window.innerHeight;


const w_n = 5;
const h_n = 5;

//大きさ
const scale_num = 10;

//幅(後で計算)
let r = 50;
//幅の何倍開けるか
const gap_ratio = 4;
//幅の値(後で計算)
let gap = 50;

let floor_list = [];
//床の大きさ
let floor_scale = 4;
floor_scale *= scale_num


//cameraとmeの差
let x_bet = 10;
let y_bet = 10;
let z_bet = 0;


//5を基準
let sight_v = 5;
let move_v = 5;



//身長
let human_height = 1.6*scale_num;

let human_list = {};


//[横,縦]
let theta = [0.0,0.0];





function Main(){
  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#myCanvas"),
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

  // シーンを作成
  const scene = new THREE.Scene();

  const light = new THREE.DirectionalLight(0xFFFFFF, 2);
  light.position.set(0,10,0);
  scene.add(light);

  // カメラを作成
  const camera = new THREE.PerspectiveCamera(45, width / height);
  //camera.lookAt(new THREE.Vector3(0, 0, 0));
  camera.position.set(0, 0, 10);

  // 箱を作成
  const geometry = new THREE.BoxGeometry(10,10,10);
  const material = new THREE.MeshNormalMaterial();
  const box = new THREE.Mesh(geometry, material);
  box.position.set(0,0,-10);
  scene.add(box);


  const loader = new GLTFLoader();
  let floor_group = new THREE.Group();
  scene.add(floor_group);

  alert('1');
  
  loader.load("../static/LIFESHAVE/lifeshave_floor.gltf", function (human) {
    alert(human);
    loader.load("../static/LIFESHAVE/lifeshave_floor.gltf", function (floor) {
      alert(floor);
      alert('2');
      //console.log(floor)
      const box = new THREE.Box3().setFromObject(floor.scene.clone());
      r = (box.max.x-box.min.x)*floor_scale/2;
      gap = gap_ratio*r;
      for(let w_k = 0; w_k < w_n; w_k++){
        for(let h_k = 0; h_k < h_n; h_k++){
          let floor_k = floor.scene.clone();
          let w_start_k = -r;
          let h_start_k = 0;

          if(w_n >= 2){
            w_start_k = -(w_n-1)*r-(w_n-1)*gap/2;
          } else {
            w_start_k = 0;
          }
          if(h_n >= 2){
            h_start_k = -(h_n-1)*r-(h_n-1)*gap/2;
          } else {
            h_start_k = 0
          }
          floor_k.position.set(w_start_k+w_k*(2*r+gap),0,h_start_k+h_k*(2*r+gap))
          floor_k.scale.set(floor_scale,floor_scale,floor_scale);
          floor_list.push(floor_k);
          camera.lookAt(floor_k.position);
          floor_group.add(floor_k);
        }
      }

      //meを作成
      let me = human.scene.clone();
      let me_x = 0;
      let me_z = 0;
      me.scale.set(scale_num,scale_num,scale_num)
      me.position.set(me_x,0,me_z);
      //const clock = new THREE.Clock();

      scene.add(me);

      for(let k = 0; k < max_num; k++){
        let human_k = human.scene.clone();
        human_k.scale.set(scale_num,scale_num,scale_num);
        human_k.position.set(0,0,0);
        scene.add(human_k);
        human_list[k] = human_k;
      }

      /*let controls = new OrbitControls(camera, renderer.domElement);
      controls.enableRotate = true; // カメラの回転を有効化*/

      
      //let targetObject = me;
      /*camera.position.set(targetObject.position.x+x_bet,targetObject.position.y+y_bet,targetObject.position.z+z_bet)
      //controls.target.copy(targetObject.position);
      camera.lookAt(targetObject.position)*/

      //tick();
      


      function pre_state_1(){
        pre_Value.position = [0,0,0];
        pre_Value.theta = [0,-Math.PI/6];
        pre_Value.camera_add_position = [0,10,0];
      }

      function state_1(){
        pre_Value.theta[0] += 0.005;
        //Text = String(Value.position);
        //Text = String(ori_stay_Value.length);
      }




      function pre_state_2(){
        if(state_2_time == 0){
          state_2_time = Date.now()
        }
        //開始する瞬間
        if(Date.now()-state_2_time > 3000){
          state_2_time = 0;


          

          
          
          tick_K = false;
        } else {
          Text = String(parseInt((4000-Date.now()+state_2_time)/1000))
        }
      }









      

      //game中
      function state_2(){
        game_tf = true;
      }








      


      function touch_func(){
        if(touch_num != 0){
          for(let k = 0; k < touch_num; k++){
            if(true){
              if(theta_first_tf){
                theta_first = pre_Value.theta.concat();
                theta_first_tf = false;
              }
              pre_Value.theta[0] = theta_first[0]+scale_num*sight_v*(touch_l[k][0]-touch_start[k][0])/4000;
              pre_Value.theta[1] = theta_first[1]+scale_num*sight_v*(touch_l[k][1]-touch_start[k][1])/4000;
              Text = touch_start[k][1];
            }
          }
        } else {
          theta_first_tf = true;
        }
      }



      



      function value_set(){
        stay_Value = ori_stay_Value;
        let delete_list = [];
        //console.log(stay_Value);
        for(let k = 0; k < stay_Value.length; k++){
          let k0 = stay_Value[k];
          //console.log(k0)
          if(k0.time <= Date.now()){
            if(Object.keys(stay_time).includes(k0.id)){
              if(stay_time[k0.id] <= k0.time){
                Value[k0.id] = k0.value;
                stay_time[k0.id] = k0.time;
                arrive_list[k0.id] = k0.time;
                delete_list.push(k);
              } else {
                delete_list.push(k);
              }
            } else {
              Value[k0.id] = k0.value;
              stay_time[k0.id] = k0.time;
              arrive_list[k0.id] = k0.time;
              delete_list.push(k);
            }

          }
        }
        for(let k of delete_list){
          delete ori_stay_Value[k];
        }
        ori_stay_Value = ori_stay_Value.filter((k) => {
          return typeof k != 'undefined';
        })
      }

      function value_show(){
        for(let k of Object.keys(Value)){
          
          let value_k = Value[k];

          //meの時
          if(k == id){
            let theta_x_k = Math.cos(value_k.theta[0])*Math.cos(value_k.theta[1]);
            let theta_y_k = Math.sin(value_k.theta[1]);
            let theta_z_k = Math.sin(value_k.theta[0])*Math.cos(value_k.theta[1]);
            //me.rotation.set();
            me.position.set(scale_num*value_k.position[0],scale_num*value_k.position[1],scale_num*value_k.position[2]);
            camera.position.set(0,0,0);
            camera.lookAt(new THREE.Vector3(theta_x_k,theta_y_k,theta_z_k));
            x_bet = scale_num*(-theta_x_k+value_k.camera_add_position[0]);
            y_bet = scale_num*(-theta_y_k+human_height+value_k.camera_add_position[1]);
            z_bet = scale_num*(-theta_z_k+value_k.camera_add_position[2]);
            camera.position.set(me.position.x+x_bet,me.position.y+y_bet,me.position.z+z_bet);
            //+','+String(camera.position.y)+','+String(camera.position.z)
          } else {
            
          }
        }
        
      }

      function arrive_func(){
        num = 0;
        for(let k of Object.keys(arrive_list)){
          if(arrive_list[k] + 3000 >= Date.now()){
            num += 1;
          }
        }
      }

      function state_func(){
        //開始するとき
        if(num == max_num && state_once){
          tick_K = true;
          state = 2;
          state_once = false;
        }
      }




      alert('3');


      
      // 毎フレーム時に実行されるループイベントです
      let tick_K = true;
      async function tick() {

        arrive_func();

        state_func();
        
        value_set();
        
        //preシリーズ(全てのstate系の関数を実行する前に一度だけ実行される関数)
        if(state == 1){
          if(tick_K == true){
            tick_K = false;
            pre_state_1();
          } else {
            state_1();
          }
        } else if(state == 2){
          if(tick_K == true){
            pre_state_2();
          } else {
            //game中
            touch_func();
            state_2();
          }
        }


        socket.emit('cs_signal_lifeshave',{'room':room,'name':name,'id':id,'value':pre_Value,'time':Date.now()+1000*rag})
        
        value_show();
        renderer.render(scene, camera); // レンダリング
       
        //Textを表示
        Text_id.innerText = Text;
        requestAnimationFrame(tick);
      }

      tick();
    });
  },undefined, function (error) {
    alert(error);
  });
}


try{
  Main();
} catch(e) {
  alert(e.message);
}




