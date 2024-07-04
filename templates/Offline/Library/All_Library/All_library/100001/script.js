window.addEventListener('DOMContentLoaded', () => {

  document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
  });
  document.addEventListener("gesturechange",(e) => {
    e.preventDefault();
  });

  //Windowサイズ
  const width = window.innerWidth;
  const height = window.innerHeight;

  //Angle
  let Angle_v = 0;
  let Angle_max_v = 0;
  const Angle_a = 0.15;
  const Angle_minus_a = 0.12;
  let Angle_max_v_main = 0.04;
  let Angle_max_v_origin = 0.04;
  let Angle = 0;
  let r_angle_button = Number(localStorage.getItem("CarRace:r_angle_button"));
  let ang_style = document.getElementById("angle_stick").style;
  ang_style.bottom = String(190-r_angle_button)+"px";
  ang_style.left = String(200-r_angle_button)+"px";
  ang_style.width = String(2*r_angle_button)+"px";
  ang_style.height = String(2*r_angle_button)+"px";
  ang_style.borderRadius = String(r_angle_button)+"px";

  let cent_style = document.getElementById("center_stick").style;
  
  let Angle_tf = false;
  let Angle_sign = 1;
  let angle_margin = 20;

  //速度(最初の方に実行して)
  let cc = 150;
  let max_v_origin = 14;
  let max_v = 14;
  let max_minus_v_origin = 7;
  let max_minus_v = 7;
  let v = 0;
  let a = 9;
  let minus_a = 12;
  while (true) {
    cc = prompt('何CCにしますか？\n50,100,150,200から選べます。');
    if (isNaN(cc) == false && cc != "") {
      cc = Number(cc);
      break;
    }
  }
  let cc_multi = 1;
  if (cc == 150) {
    cc_multi = 1;
  } else if (cc == 200) {
    cc_multi = 1.5;
  } else if (cc == 100) {
    cc_multi = 0.9;
  } else if (cc == 50) {
    cc_multi = 0.8;
  } else if (cc == 10000) {
    alert('隠し機能');
    cc_multi = 100;
  } else {
    cc_multi = 1;
  }

  max_v = max_v_origin * cc_multi;
  max_minus_v = max_minus_v_origin * cc_multi;
  max_v_origin = max_v;
  a = a * cc_multi;
  minus_a = minus_a * cc_multi;
  Angle_max_v = Angle_max_v * cc_multi;
  Angle_max_v_origin = Angle_max_v_origin * cc_multi;


  let x = null;
  let y = null;
  let touch_num = 0;
  let time = Date.now();
  let delta_time = 0;
  let Cubist_pos = {};
  const l = 20;
  let resize_tf = false;
  let Start_time = Date.now();
  let now_time = Date.now();
  let Timedelta = 0;
  let Finish_time = 0;
  let tf_k = false;




  //Road
  let OnRoad_list = [];
  let OnRoad_tf = true;

  //Item
  //0:無し,1:キノコ(2秒速度上昇(1.2倍))
  const item_color_list = ['0,0,0', '255,0,0']
  let now_item = 0;
  let now_have_item = 0;
  let Item_html = document.getElementById("item");
  let Item_button_html = document.getElementById("item_button");
  let item_color = "0,0,0,0";
  let item_r = 30;
  let item_place = [[0, 200]];
  let item_time = Date.now();
  let item_butt_x = 180;
  let item_butt_y = height - 430;
  let item_butt_r = 30;
  let item_time_fin = 0;
  let item_time_list = [0, 2];
  function Item_get() {
    if (now_have_item == 0) {
      now_have_item = 1 + Math.floor((item_color_list.length - 1) * Math.random());
      item_color = item_color_list[now_have_item];
      item_time_fin = item_time_list[now_have_item];
    } else {
      return;
    }
  }

  //Item_draw();




  // [[[x,z],w,h]]
  //x,zは右下の座標(左側がZ軸の正の方向)

  //Road
  let Road_list = [[[-250, -900], 500, 1800],
  [[-250, 900], 1300, 500],
  [[1050, 900], 500, 1000],
  [[1050, 1900], 1800, 500],
  [[2850, 1400], 500, 1000],
  [[3350, 1400], 1000, 150],
  [[4350, -400], 500, 1950],
  [[4850, -400], 700, 500],
  [[5050, -1100], 500, 700],
  [[4850, -1600], 700, 500],
  [[4350, -2600], 500, 1500],
  [[3150, -3100], 1700, 500],
  [[3000, -3100], 150, 1450],
  [[1850, -1800], 1150, 150],
  [[1350, -2600], 500, 950],
  [[-450, -2600], 1800, 500],
  [[-950, -2600], 500, 1700],
  [[-450, -1400], 700, 500]];

  //Wall
  const wall_h = 50;
  //外回り
  let Wall_list = [[[-510, -650], 10, 2300],
  [[-510, 1650], 1300, 10],
  [[790, 1650], 10, 1000],
  [[790, 2650], 2810, 10],
  [[3600, 2150], 10, 510],
  [[3610, 2150], 1340, 10],
  [[4950, 200], 10, 1950],
  [[4960, 200], 700, 10],
  [[5650, -1700], 10, 1900],
  [[4960, -1710], 700, 10],
  [[4950, -3200], 10, 1500],
  [[2800, -3210], 2160, 10],
  [[2790, -3210], 10, 1100],
  [[2050, -2110], 750, 10],
  [[2050, -2810],10,700],
  [[-1200,-2810],3250,10],
  [[-1210,-2810],10,2160],
  [[-1200,-650],690,10]];
  //内回り
  let Wall_list_inside = [[[500,-1700],10,2350],
                         [[510,640],1290,10],
                         [[1800,640],10,1000],
                         [[1800,1640],690,10],
                         [[2490,1140],10,500],
                         [[2500,1140],1340,10],
                         [[3840,-510],10,1660],
                         [[3850,-510],1100,10],
                         [[4940,-1000],10,490],
                         [[4240,-1000],710,10],
                         [[4240,-2490],10,1490],
                         [[3250,-2500],1000,10],
                         [[3250,-2490],10,950],
                         [[510,-1550],2740,10]];

  //Lap
  let lap = 0;
  let lap_can = false;
  let lap_list = [];
  let last_lap_time = Date.now();
  let lap_time = 0;



  //Text
  let txt = "";
  const text = document.getElementById('text');
  function txt_draw(txt_k) {
    txt = String(txt_k)
    text.innerHTML = txt;
  }

  //桁指定の四捨五入の関数作成
  function new_round(num_k, digit_k) {
    const pow_digit_k = Math.pow(10, digit_k);
    return Math.round(num_k * pow_digit_k) / pow_digit_k;
  }


  //Camera
  let camera_x = -700;
  let camera_y = 100;
  let camera_z = -700;




  //加減速ボタン
  let acc_bra_l = 60;
  let acc_bra_tf = false;
  let acc_bra_pre_tf = false;
  //加速ボタン
  let acc_butt_x = width - 150;
  let acc_butt_y = height - 220;
  //減速ボタン
  let bra_butt_x = width - 150;
  let bra_butt_y = height - 120;


  //方向ボタンの中心
  let angle_stick = document.getElementById('angle_stick');
  /*angle_stick.style.borderRadius = String(r_angle_button);
  angle_stick.style.height = '*/
  let angle_button_x = 200;
  let angle_button_y = height - 190;

  /*let isSmartPhone = false;

  if (window.matchMedia && window.matchMedia('(max-device-width: 640px)').matches) {
    isSmartPhone = true;
  } else {
    isSmartPhone = false;
  }
  if (isSmartPhone) {
    //加減速ボタン
    acc_bra_l = 60;
    acc_bra_tf = false;
    //加速ボタン
    acc_butt_x = width - 150;
    acc_butt_y = height - 220;
    //減速ボタン
    ra_butt_x = width - 150;
    bra_butt_y = height - 120;

    //方向ボタンの中心
    angle_button_x = 180;
    angle_button_y = height - 190;

    r_angle_button = 120;
  }*/

  //Banker
  const banker_mult = 3;
  let banker_x_min = null;
  let banker_y_min = null;
  let banker_x_max = null;
  let banker_y_max = null;
  let banker_w = 0;
  let banker_h = 0;
  let banker_margin = 200;

  //Cubistの位置
  let c_x = 0;
  let c_z = 0;
  let pre_x = 0;
  let pre_z = 0;




  let frame = 0;
  let key = [];






  //Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#myCanvas')
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(`window`.devicePixelRatio);

  //scene
  const scene = new THREE.Scene();


  //camera
  const camera = new THREE.PerspectiveCamera(20, width / height, 1, 30000);
  camera.position.set(0, camera_y, camera_z);
  camera.lookAt(new THREE.Vector3(0, 0, 0));




  //Cubist
  const Cubist_geometry = new THREE.BoxGeometry(l, l, l);
  const Cubist_material = new THREE.MeshPhongMaterial({ color: 0x0000ff });
  const Cubist = new THREE.Mesh(Cubist_geometry, Cubist_material);
  Cubist.position.set(0, 0, 0);
  Cubist.rotation.y = 0;
  scene.add(Cubist);



  //Roadを描画する関数
  function Road_Make(x_k, z_k, w_k, h_k) {
    var Road_geometry_k = new THREE.PlaneGeometry(w_k, h_k);
    var Road_material_k = new THREE.MeshBasicMaterial({ color: 0x228b22 });
    var Road_k = new THREE.Mesh(Road_geometry_k, Road_material_k);
    Road_k.position.set(x_k + w_k / 2, -l / 2, z_k + h_k / 2);
    Road_k.rotation.x = -Math.PI / 2;
    scene.add(Road_k);
  }


  //Roadの描画とバンカー計算
  for (let k = 0; k < Road_list.length; k++) {
    let R_k = Road_list[k];
    Road_Make(R_k[0][0], R_k[0][1], R_k[1], R_k[2]);
    if (banker_x_min == null) {
      banker_x_min = R_k[0][0] - banker_margin;
      banker_y_min = R_k[0][1] - banker_margin;
      banker_x_max = R_k[0][0] + R_k[1] + banker_margin;
      banker_y_max = R_k[0][1] + R_k[2] + banker_margin;
    } else {
      if (banker_x_min > R_k[0][0] - banker_margin) banker_x_min = R_k[0][0] - banker_margin;
      if (banker_y_min > R_k[0][1] - banker_margin) banker_y_min = R_k[0][1] - banker_margin;
      if (banker_x_max < R_k[0][0] + R_k[1] + banker_margin) banker_x_max = R_k[0][0] + R_k[1] + banker_margin;
      if (banker_y_max < R_k[0][1] + R_k[2] + banker_margin) banker_y_max = R_k[0][1] + R_k[2] + banker_margin;
    }
  }
  banker_w = banker_x_max - banker_x_min + banker_margin * 2;
  banker_h = banker_y_max - banker_y_min + banker_margin * 2;



  //Wallを描画する関数
  function Wall_Make(x_k, z_k, w_k, h_k) {
    var Wall_geometry_k = new THREE.BoxGeometry(w_k, wall_h, h_k);
    var Wall_material_k = new THREE.MeshBasicMaterial({ color: 0x7fffd4 });
    var Wall_k = new THREE.Mesh(Wall_geometry_k, Wall_material_k);
    Wall_k.position.set(x_k + w_k / 2, -l / 2, z_k + h_k / 2);
    scene.add(Wall_k);
  }

  //Wallの描画
  //外回り
  for (let k = 0; k < Wall_list.length; k++) {
    let W_k = Wall_list[k];
    Wall_Make(W_k[0][0], W_k[0][1], W_k[1], W_k[2]);
  }
  for (let k = 0; k < Wall_list_inside.length; k++) {
    let W_k = Wall_list_inside[k];
    Wall_Make(W_k[0][0], W_k[0][1], W_k[1], W_k[2]);
  }




  //Banker
  var Banker_geometry = new THREE.PlaneGeometry(banker_w, banker_h);
  var Banker_material = new THREE.MeshBasicMaterial({ color: 0xdeb887 });
  var Banker = new THREE.Mesh(Banker_geometry, Banker_material);
  Banker.rotation.x = -Math.PI / 2;
  Banker.position.set((banker_x_min + banker_x_max) / 2, -l / 2 - 0.8, (banker_y_min + banker_y_max) / 2);
  scene.add(Banker);

  //Goal
  var Goal_geometry = new THREE.BoxGeometry(1000, l / 2, 2);
  var Goal_material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  var Goal = new THREE.Mesh(Goal_geometry, Goal_material);
  Goal.position.set(0, l / 4, 1);
  scene.add(Goal);

  //Item
  function Item_draw(x_k, z_k) {
    var Item_geometry_k = new THREE.SphereGeometry(item_r, 32, 32);
    var Item_material_k = new THREE.MeshBasicMaterial({ color: 0x0077ff });
    var Item_k = new THREE.Mesh(Item_geometry_k, Item_material_k);
    Item_k.position.set(x_k, item_r, z_k);
    return Item_k;
  }
  for (let k = 0; k < item_place.length; k++) {
    scene.add(Item_draw(item_place[k][0], item_place[k][1]));
  }



  //light
  const light = new THREE.AmbientLight(0xffffff, 1);

  scene.add(light);




  function touch_cancel(k) {
    if (resize_tf) {
      k.preventDefault();
      //alert('Cancel');
    }
  }
  //Touchイベント
  try {
    window.addEventListener('touchstart', (event_k) => {
      touch_cancel(event_k);
      x = [];
      y = [];
      touch_num = event_k.touches.length;
      for (let k = 0; k < touch_num; k++) {
        x.push(event_k.touches[k].clientX);
        y.push(event_k.touches[k].clientY);
      }
    });
    window.addEventListener('touchmove', (event_k) => {
      touch_cancel(event_k);
      x = [];
      y = [];
      touch_num = event_k.touches.length;
      for (let k = 0; k < touch_num; k++) {
        x.push(event_k.touches[k].clientX);
        y.push(event_k.touches[k].clientY);
      }
      //console.log(x,y)
    });
    window.addEventListener('touchend', (event_k) => {
      touch_num = event_k.touches.length;
      if (touch_num >= 1) {
        x = [];
        y = [];
        for (let k = 0; k < touch_num; k++) {
          x.push(event_k.touches[k].clientX);
          y.push(event_k.touches[k].clientY);
        }
      } else {
        x = null;
        y = null;
      }

    });
  } catch (error_k) {
    alert(error_k);
  }
  //KeyCodeイベント
  try{
    window.addEventListener('keydown', (event_k) => {
      if (event_k.key == 'w') {
        key.push('w')
      }
      if (event_k.key == 's') {
        key.push('s')
      }
      if (event_k.key == 'a'){
        key.push('a')
      }
      if (event_k.key == 'd'){
        key.push('d')
      }
    });
    window.addEventListener('keyup', (event_k) => {
      if (event_k.key == 'w') {
        key = key.filter(function(key0) {
  　　　　　return key0 != 'w';
   　　　});
      }
      if (event_k.key == 's') {
        key = key.filter(function(key0) {
  　　　　　return key0 != 's';
   　　　});
      }
      if (event_k.key == 'a'){
        key = key.filter(function(key0) {
  　　　　　return key0 != 'a';
  　　 　});
      }
      if (event_k.key == 'd'){
        key = key.filter(function(key) {
  　　　　　return key != 'd';
  　　 　});
      }
    });
  } catch (error_k) {
  
  }


  let pp_x = 0;
  let pp_z = 0;



  //--------------------------------------------------------






  function tick() {
    requestAnimationFrame(tick);


    // アニメーション処理をここに書く
    //Cubist.rotation.y += 0.01;

    //Cubist_posの設定
    Cubist_pos = Cubist.position;



    delta_time = (Date.now() - time) / 1000;
    time = Date.now();

    //道に乗っているか
    //OnRoad_list = [];
    OnRoad_tf = false;
    for (let k = 0; k < Road_list.length; k++) {
      let R_k = Road_list[k];
      let OnR_k = false;
      OnR_k = (Cubist_pos.x < R_k[0][0] + R_k[1] && Cubist_pos.x > R_k[0][0] && Cubist_pos.z < R_k[0][1] + R_k[2] && Cubist_pos.z > R_k[0][1]);
      if (OnR_k) {
        OnRoad_tf = true;
      }

      //item使用状態だとRoadと同じとする
      if (now_item != 0) {
        OnRoad_tf = true;
      }
      //OnRoad_list.push(OnR_k);
    }



    //Item系
    for (let k = 0; k < item_place.length; k++) {
      let I_k = item_place[k];
      if (Math.pow(Cubist_pos.x - I_k[0], 2) + Math.pow(Cubist_pos.z - I_k[1], 2) < Math.pow(l / 2 + item_r, 2)) {
        //alert('In')
        Item_get();
      }
    }


    if (x != null && y != null) {


      //Item使用時
      if (now_have_item != 0) {
        if (Math.pow(item_butt_x - x[0], 2) + Math.pow(item_butt_y - y[0], 2) <= Math.pow(item_butt_r, 2)) {
          //alert('in')
          now_item = now_have_item;
          now_have_item = 0;
          item_color = '0,0,0';
          item_time = Date.now();
          OnRoad_tf = true;

        } else if (touch_num >= 2) {
          if (Math.pow(item_butt_x - x[1], 2) + Math.pow(item_butt_y - y[1], 2) <= Math.pow(item_butt_r, 2)) {
            now_item = now_have_item;
            now_have_item = 0;
            item_color = '0,0,0,0';
            item_time = Date.now();
            OnRoad_tf = true;
          }
          if(touch_num >= 3){
            if (Math.pow(item_butt_x - x[2], 2) + Math.pow(item_butt_y - y[2], 2) <= Math.pow(item_butt_r, 2)) {
              now_item = now_have_item;
              now_have_item = 0;
              item_color = '0,0,0,0';
              item_time = Date.now();
              OnRoad_tf = true;
            }
          }
        }
      }



      //加速
      if (('w' in key) || (acc_butt_x - acc_bra_l < x[0] && x[0] < acc_butt_x && acc_butt_y - acc_bra_l < y[0] && y[0] < acc_butt_y)) {
        v += a * delta_time;
        if (v > max_v) v = max_v;
        acc_bra_tf = true;
      } else if (touch_num >= 2) {
        if (acc_butt_x - acc_bra_l < x[1] && x[1] < acc_butt_x && acc_butt_y - acc_bra_l < y[1] && y[1] < acc_butt_y) {
          v += a * delta_time;
          if (v > max_v) v = max_v;
          acc_bra_tf = true;
        }
      }

      //減速
      if (('s' in key) || (bra_butt_x - acc_bra_l < x[0] && x[0] < bra_butt_x && bra_butt_y - acc_bra_l < y[0] && y[0] < bra_butt_y)) {
        v -= a * delta_time;
        if (v < -max_minus_v) v = -max_minus_v;
        acc_bra_tf = true;
      } else if (touch_num >= 2) {
        if (bra_butt_x - acc_bra_l < x[1] && x[1] < bra_butt_x && bra_butt_y - acc_bra_l < y[1] && y[1] < bra_butt_y) {
          v -= a * delta_time;
          if (v < -max_minus_v) v = -max_minus_v;
          acc_bra_tf = true;
        }
      }
      //Angleを変更
      //方向ボタンから半径r_angle_button以内の時実行
      if('a' in key || 'd' in key) {
        if('a' in key){
          cent_style.left = String(170-r_angle_button)+"px";
          //cent_style.bottom = String(160)+"px";
          Angle_sign = -1;
          Angle_max_v = Math.abs(Angle_max_v_main * (170-r_angle_button) / r_angle_button);
          Angle_tf = true;
        } else if('d' in key){
          cent_style.left = String(170+r_angle_button)+"px";
          //cent_style.bottom = String(160)+"px";
          Angle_sign = 1;
          Angle_max_v = Math.abs(Angle_max_v_main * (170-r_angle_button) / r_angle_button);
          Angle_tf = true;
        }
      }
      if (v != 0 || acc_bra_tf) {

        if (touch_num >= 1 && (Math.pow(x[0] - angle_button_x, 2) + Math.pow(y[0] - angle_button_y, 2)) < r_angle_button * r_angle_button) {
          if(Math.abs(x[0] - angle_button_x) >= angle_margin){
            //alert('hey')
            cent_style.left = String(170+x[0]-angle_button_x)+"px";
            cent_style.bottom = String(160-y[0]+angle_button_y)+"px";
            Angle_sign = Math.sign(angle_button_x - x[0]);
            Angle_max_v = Math.abs(Angle_max_v_main * (angle_button_x - x[0]) / r_angle_button);
            Angle_tf = true;
          }
        } else if (touch_num >= 2) {
          if ((Math.pow(x[1] - angle_button_x, 2) + Math.pow(y[1] - angle_button_y, 2)) < r_angle_button * r_angle_button) {
            if(Math.abs(x[1] - angle_button_x) >= angle_margin){
              cent_style.left = String(170+x[1]-angle_button_x)+"px";
              cent_style.bottom = String(160-y[1]+angle_button_y)+"px";
              Angle_sign = Math.sign(angle_button_x - x[1]);
              Angle_max_v = Math.abs(Angle_max_v_main * (angle_button_x - x[1]) / r_angle_button);
              Angle_tf = true;
            }
          }

        }
      }
      if(Angle_tf == false){
        cent_style.left = "170px";
        cent_style.bottom = "160px";
      }


    }



    //以下で速度を実際に変える
    if (acc_bra_tf == false) {
      if (Math.sign(v - Math.sign(v) * a * delta_time) != Math.sign(v)) {
        v = 0;
      } else {
        v = v - Math.sign(v) * minus_a * delta_time;
      }
    }
    acc_bre_pre_tf = acc_bra_tf;
    acc_bra_tf = false;




    //Itemを使用している時の速度
    if (now_item == 1) {

      if (Date.now() - item_time <= 1000 * item_time_fin) {
        max_v = max_v_origin * 1.5;
        Angle_max_v_main = Angle_max_v_origin * 1.5;
      } else {
        max_v = max_v_origin;
        Angle_max_v_main = Angle_max_v_origin;
        now_item = 0;
      }
      v = max_v;
      //Angle_v = Angle_max_v*Angle_sign;
    }
    //txt_draw(Date.now()-item_time);
    //txt_draw(OnRoad_tf)


    //速度計算
    pre_x = Cubist.position.x;
    pre_z = Cubist.position.z;
    if (OnRoad_tf) {
      pre_x += v * Math.sin(Angle);
      pre_z += v * Math.cos(Angle);
    } else {
      pre_x += v * Math.sin(Angle) / banker_mult;
      pre_z += v * Math.cos(Angle) / banker_mult;
    }


    tf_k = false;
    c_x = Cubist.position.x;
    c_z = Cubist.position.z;
    for (let k = 0; k < Wall_list.length; k++) {
      let W_k = Wall_list[k];
      if (
        (
          (
            Math.sign(c_x - W_k[0][0]) != Math.sign(pre_x - W_k[0][0]) || Math.sign(c_x - W_k[0][0] - W_k[1]) != Math.sign(pre_x - W_k[0][0] - W_k[1])
          ) && (
            W_k[0][1] <= c_z && c_z <= W_k[0][1] + W_k[2]
          )
        ) || (
          (
            Math.sign(c_z - W_k[0][1]) != Math.sign(pre_z - W_k[0][1]) || Math.sign(c_z - W_k[0][1] - W_k[2]) != Math.sign(pre_z - W_k[0][1] - W_k[2])
          ) && (
            W_k[0][0] <= c_x && c_x <= W_k[0][0] + W_k[1]
          )
        )
      ) {
        tf_k = true;
      }
    }
    for (let k = 0; k < Wall_list_inside.length; k++) {
      let W_k = Wall_list_inside[k];
      if (
        (
          (
            Math.sign(c_x - W_k[0][0]) != Math.sign(pre_x - W_k[0][0]) || Math.sign(c_x - W_k[0][0] - W_k[1]) != Math.sign(pre_x - W_k[0][0] - W_k[1])
          ) && (
            W_k[0][1] <= c_z && c_z <= W_k[0][1] + W_k[2]
          )
        ) || (
          (
            Math.sign(c_z - W_k[0][1]) != Math.sign(pre_z - W_k[0][1]) || Math.sign(c_z - W_k[0][1] - W_k[2]) != Math.sign(pre_z - W_k[0][1] - W_k[2])
          ) && (
            W_k[0][0] <= c_x && c_x <= W_k[0][0] + W_k[1]
          )
        )
      ) {
        tf_k = true;
      }
    }

    if (tf_k == false) {
      pp_x = Cubist.position.x;
      pp_z = Cubist.position.z;
      if (OnRoad_tf) {
        Cubist.position.z += v * Math.cos(Angle);
        Cubist.position.x += v * Math.sin(Angle);
      } else {
        Cubist.position.z += v * Math.cos(Angle) / banker_mult;
        Cubist.position.x += v * Math.sin(Angle) / banker_mult;
      }
    } else {
      v = 0;

      Cubist.position.x = pp_x;
      Cubist.position.z = pp_z;
    }



    //方向を実際に変える
    Angle = Cubist.rotation.y;
    //Angle_v += Angle_sign*Angle_a*delta_time;
    if (Angle_tf == false) {
      if (Math.sign(Angle_v - Math.sign(Angle_v) * Angle_minus_a * delta_time) != Math.sign(Angle_v)) {
        Angle_v = 0;
      } else {
        Angle_v = Angle_v - Math.sign(Angle_v) * Angle_minus_a * delta_time;
      }
    } else {
      if (OnRoad_tf) {
        Angle_v = Angle_v + Angle_sign * Angle_a * delta_time * v / max_v;
      } else {
        Angle_v = Angle_v + Angle_sign * Angle_a * delta_time * v / max_v / banker_mult;
      }
      if (Angle_v > Angle_max_v) {
        Angle_v = Angle_max_v;
      } else if (Angle_v < -Angle_max_v) {
        Angle_v = -Angle_max_v;
      }
    }
    Angle_tf = false;
    /*if(OnRoad) {
      Cubist.rotation.y += Angle_v;
    } else {
      Cubist.rotation.y += Angle_v/banker_mult;
    }*/
    Cubist.rotation.y += Angle_v;







    //周回判定
    if(4950<=Cubist.position.x && Cubist.position.x<=5650 && -1000<=Cubist.position.z && Cubist.position.z<=-950){
      lap_can = true;
    }
    if(lap_can && -500<=Cubist.position.x && Cubist.position.x<=500 && 0<=Cubist.position.z && Cubist.position.z<=20){
      lap += 1;
      lap_can = false;
      lap_list.push((Date.now()-last_lap_time)/1000);
      lap_time = (Date.now()-last_lap_time)/1000;
      last_lap_time = Date.now();
    }





    //画面サイズが変更された時
    resize_tf = false;
    if (window.innerHeight != height || window.innerWidth != width) {
      //alert('Resize')
      resize_tf = true;
    }

    if(lap != 0){
      lap_ave = lap_list.reduce(function(pre_k,k){
        return pre_k+k;
      })/lap;
    } else {
      lap_ave = 0;
    }
    //座標をText表示(41行目参照のこと)
    //txt_draw('('+String(new_round(Cubist_pos.x,3))+','+String(new_round(Cubist_pos.z,3))+')');
    now_time = Date.now();
    Timedelta = Math.floor((now_time - Start_time) / 10) / 100;
    if(lap >= 1){
      txt_draw(String(Timedelta)+'<br>CC:'+String(cc)+
             ' Lap:'+String(lap)+
             ' LapTime:'+String(lap_time)+
             ' Time:'+String(Math.floor((Date.now()-last_lap_time)/100)/10)+
             ' LapAve:'+String(Math.floor(100*lap_ave)/100));
    } else {
      txt_draw(String(Timedelta)+'<br>Lap:'+String(lap))
    }


    //Itemを表示
    //console.log(now_have_item);
    if (now_have_item == 0) {
      Item_html.style.backgroundColor = "rgba(0,0,0,0)";
      Item_button_html.style.backgroundColor = "rgba(0,0,0,0)";
    } else {
      Item_html.style.backgroundColor = "rgba(" + item_color + ",1)";
      Item_button_html.style.backgroundColor = "rgba(" + item_color + ",0.4)";
    }
    camera.position.set(Cubist_pos.x + camera_x * Math.sin(Angle), Cubist_pos.y + camera_y, Cubist_pos.z + camera_z * Math.cos(Angle))
    camera.lookAt(new THREE.Vector3(Cubist_pos.x, 20 + Cubist_pos.y, Cubist_pos.z));
    //camera.lookAt(new HTMLHRElement.Vector3())

    renderer.render(scene, camera); // レンダリング
  }
  tick();
});
