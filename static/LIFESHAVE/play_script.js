//alert('start')
import * as THREE from "three";
import { GLTFLoader } from "GLTFLoader";
import { OrbitControls } from "OrbitControls";
//alert('import')


document.addEventListener("gesturestart", (e) => {
  e.preventDefault();
});




let text = 'Hello';
let text_id = document.getElementById('info');

text_id.textContent = text;


let w = window.innerWidth;
let h = window.innerHeight;
let me_x = 0;
let me_z = 0;

let Subtle_id = document.getElementById('Subtle');


let Center_id = document.getElementById('Center').style;
Center_id.right = Math.floor(w/2-2)+'px';
Center_id.bottom = Math.floor(h/2-10)+'px';


let view_theta = 0;
let view_arg = 0;
//0.01->0.001;
let view_multi_max = 0.01;
let view_multi_min = 0.001;
let view_multi = 0.01;
let view_multi_arg_max = 0.01;
let view_multi_arg_min = 0.001;
let view_multi_arg = 0.01;
let view_pre_theta = 0;
let view_pre_arg = 0;
let view_tf = false;
let view_count = 0;


let v_max = 0.05;
let v_min = 0.0125;
let v = 0.05;

let touch_list = [];
let touch_move_list = [];
let touch_length = 0;
let touch_pre_list = [];
let touch_first = [];

let ground_list = [[0,0],[0,15]];
let ground_l = 8;
let ground_h = 0.5;
let ground_cube_list = [];

//[(初期位置),(角度),(偏角),(start_time),(発射した人)]
let bullet_v = 150;
let bullet_list = [];
//bullet_list.push([0,0,0,0,Math.PI/10,Date.now(),'T2718'])
let bullet_list_mesh = [];
let bullet_r = 0.1;

let g = 9.8;



let start_tf = true;
let start_time = 0;
let timer = 0;

//human
let human_position_list = [[0,-10,-3],[0,-10,-2],[0,-0.7,15]]

let me;
let human_list;


// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("black");

// camera
//OrthographicCamera
//PerspectiveCamera
const camera = new THREE.PerspectiveCamera(60, w / h, 0.05, 2000);
camera.position.set(0, 0, 1);

// renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
});
// lightとcolorEncodingの調整
const light = new THREE.AmbientLight(0xffffff, 2);
scene.add(light);
renderer.outputEncoding = THREE.sRGBEncoding;

// mouseでカメラの操作ができるようにする
//new OrbitControls(camera, renderer.domElement);

// modelを表示



//地面を制作
for(let k = 0; k < ground_list.length; k++){
  const geometry = new THREE.BoxGeometry( ground_l, ground_h, ground_l ); 
  const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
  const cube = new THREE.Mesh( geometry, material ); 
  cube.position.set(ground_list[k][0], -1-ground_h/2, ground_list[k][1]);
  scene.add( cube );
  ground_cube_list.push(cube);
}




//humancubistを読み込む
const loader = new GLTFLoader();
loader.load("../static/LIFESHAVE/humancubist.gltf", function (human) {
  
  //meを作成
  me = human.scene.clone();
  me_x = 0;
  me_z = 0;

  me.position.set(me_x,0,me_z);
  //const clock = new THREE.Clock();

  scene.add(me);

  //humanを作成
  human_list = [];
  for(let k = 0; k < human_position_list.length; k++){
    let human_k = human.scene.clone();
    scene.add(human_k);
    human_k.position.set(human_position_list[k][0],human_position_list[k][1],human_position_list[k][2]);
    human_list.push(human_k);
  }
  

  function animate() {
    // 次に実行されるときの時間差を保存
    //const delta = clock.getDelta();
    // アニメーションを更新させる
    //if (mixer) mixer.update(delta);
    // 毎回レンダリングをすることでアニメーション効果
    main_func();
    
    
    renderer.render(scene, camera);
    // 1秒に60回(60fps)
    requestAnimationFrame(animate);
  }
  animate();
});


function main_func(){
  if(start_tf){
    start_time = Date.now();
    start_tf = false;
  }
  
  //human_position_list[0][0] += 0.01;

  touch_func();
  
  value_set();
}




function touch_func(){
  //console.log(view_tf)
  //text = 'None';
  if(touch_length == 0){
    view_tf = true;
    return;
  }
  //view_tf = false;
  let view_tf_k = false;
  for(let k = 0; k < touch_length; k++){
    if(!((80 <= touch_list[k][0] && touch_list[k][0] <= 160 && h-160 <= touch_list[k][1] && touch_list[k][1] <= h-80) || (200 <= touch_list[k][0] && touch_list[k][0] <= 280 && h-160 <= touch_list[k][1] && touch_list[k][1] <= h-80) || (140 <= touch_list[k][0] && touch_list[k][0] <= 220 && h-250 <= touch_list[k][1] && touch_list[k][1] <= h-170) || (140 <= touch_list[k][0] && touch_list[k][0] <= 220 && h-80 <= touch_list[k][1] && touch_list[k][1] <= h-20))){

      
      view_tf_k = true;
    }
  }
  //text = view_tf+'\n'+view_tf_k+'\n'+view_pre_theta.toString()
  if(view_tf == true && view_tf_k == true){
    view_pre_theta = view_theta;
    view_pre_arg = view_arg;
    for(let k = 0; k < touch_length; k++){
      touch_first = touch_list[k]
    }
    view_tf = false;
    //alert(view_tf)
  }
  if(view_tf_k == false){
      
    view_tf = true;
  }
  //}
  
  

  let view_k = false;
 
  for(let k = 0; k < touch_length; k++){
    //Left
    if(80 <= touch_list[k][0] && touch_list[k][0] <= 160 && h-160 <= touch_list[k][1] && touch_list[k][1] <= h-80) {
      me_x += v*Math.cos(view_theta);
      me_z -= v*Math.sin(view_theta);

    //Right
    } else if(200 <= touch_list[k][0] && touch_list[k][0] <= 280 && h-160 <= touch_list[k][1] && touch_list[k][1] <= h-80) {
      me_x -= v*Math.cos(view_theta);
      me_z += v*Math.sin(view_theta);

    //Up
    } else if(140 <= touch_list[k][0] && touch_list[k][0] <= 220 && h-250 <= touch_list[k][1] && touch_list[k][1] <= h-170){
      me_z += v*Math.cos(view_theta);
      me_x += v*Math.sin(view_theta);
      
    //Back
    } else if(140 <= touch_list[k][0] && touch_list[k][0] <= 220 && h-80 <= touch_list[k][1] && touch_list[k][1] <= h-20){
      me_z -= v*Math.cos(view_theta);
      me_x -= v*Math.sin(view_theta);
    //その他
    } else {
      if(view_k == false){
        view_k = true;
        view_theta = view_pre_theta + view_multi*(touch_first[0]-touch_move_list[k][0]);
        view_arg = view_pre_arg - view_multi_arg*(touch_move_list[k][1]-touch_first[1]);
        if(view_arg > Math.PI/2) view_arg = Math.PI/2;
        if(view_arg < -Math.PI/2) view_arg = -Math.PI/2;
      }
    }
  }
  //text = 'view_theta:'+view_theta.toString()+'<br>view_pre:'+view_pre_theta.toString()+'<br>view_tf:'+view_tf+'<br>touch_length:'+touch_length.toString();
}



function value_set(){
  //positionの設定
  //me
  me.position.set(me_x,-0.7,me_z);
  me.rotation.set(0,view_theta,0);
  //human
  for(let k = 0; k < human_list.length; k++){
    let human_position_k = human_position_list[k];
    human_list[k].position.set(human_position_k[0],human_position_k[1],human_position_k[2]);
  }
  //camera
  camera.position.set(me_x+0.2*Math.sin(view_theta),-0.5,me_z+0.2*Math.cos(view_theta));
  camera.lookAt(me_x+Math.sin(view_theta),-0.5+Math.sin(view_arg),me_z+Math.cos(view_theta));


  //銃弾を描画
  if(bullet_list_mesh.length >= 1){
    for(let k = 0; k < bullet_list_mesh.length; k++){
      let k0 = bullet_list[k];
      bullet_list_mesh[k].position.set(k0[0]+bullet_v*Math.cos(k0[4])*Math.sin(k0[3])*(Date.now()-k0[5])/1000,k0[1]+bullet_v*Math.sin(k0[4])*(Date.now()-k0[5])/1000-1/2*g*((Date.now()-k0[5])/1000)**2,k0[2]+bullet_v*Math.cos(k0[4])*Math.cos(k0[3])*(Date.now()-k0[5])/1000);
    }
  }


  timer = (Date.now()-start_time)/1000;


  text = (Math.floor(100*timer)/100).toString();
  //text = Math.floor(view_theta*180/Math.PI);

  
  text_id.innerHTML = text;
}


document.addEventListener('touchstart', function(event_k) {
  touch_length = event_k.touches.length;
  touch_list = [];
  for(let k = 0; k < touch_length; k++){
    let k0 = event_k.touches[k];
    touch_list.push([k0.pageX,k0.pageY]);
      
  }
  touch_move_list = touch_list.concat();
  //touch_pre_
  if(w-200 <= touch_list[touch_length-1][0] && touch_list[touch_length-1][0] <= w-100 && h-200 <= touch_list[touch_length-1][1] && touch_list[touch_length-1][1] <= h-100){
    const geometry_k = new THREE.SphereGeometry( bullet_r, 30, 30 ); 
    const material_k = new THREE.MeshBasicMaterial( { color: 0xffff00 } ); 
    const sphere_k = new THREE.Mesh( geometry_k, material_k ); scene.add( sphere_k );
    bullet_list_mesh.push(sphere_k)
    bullet_list.push([me_x,-0.7,me_z,view_theta,view_arg,Date.now(),'T2718'])
  }
  if(w-280 <= touch_list[touch_length-1][0] && touch_list[touch_length-1][0] <= w-200 && 80 <= touch_list[touch_length-1][1] && touch_list[touch_length-1][1] <= 160){
    //alert('Hey')
    view_count += 1;

    //粗雑な方
    if(view_count%2 == 0){
      view_multi = view_multi_max;
      view_multi_arg = view_multi_arg_max;
      v = v_max;
      Subtle_id.style.background = 'yellow';
      
    //精緻な方
    } else {
      view_multi = view_multi_min;
      view_multi_arg = view_multi_arg_min;
      v = v_min;
      Subtle_id.style.background = 'green';
    }
  }
  
}, false);

document.addEventListener('touchmove', function(event_k) {
  //touch_length = event_k.touches.length;
  touch_move_list = [];
  for(let k = 0; k < touch_length; k++){
    let k0 = event_k.touches[k];
    touch_move_list.push([k0.pageX,k0.pageY]);

  }

}, false);

document.addEventListener('touchend', function(event_k) {
  touch_length = event_k.touches.length;
  touch_list = [];
  for(let k = 0; k < touch_length; k++){
    let k0 = event_k.touches[k];
    touch_list.push([k0.pageX,k0.pageY]);

  }
  touch_move_list = touch_list.concat();

}, false);
