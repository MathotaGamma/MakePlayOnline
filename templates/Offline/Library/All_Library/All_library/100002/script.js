const width = window.innerWidth;
const height = window.innerHeight;
const fr = 30;

const width_num = 10;
const height_num = 20;
const height_num_all = 40;

const width_in = 250;
const left = (width - width_in) / 2;
const r = width_in / width_num;
const up = (height - r * height_num) / 2;
const under = up + r * height_num;
let field = [];
let field_all = [];

let Amino = {};
let T_change_x = 0;
let T_change_y = 0;

let state = 'start';
let mino_list = [];
let mino_list_next = [];
let now_mino = '';

// 落ちる
let one_drop_time_base = 0.5;
let one_drop_time = 0.5;
let one_drop_timer = new Date().getTime();
let contact_drop_time = 0.7;
let contact_drop_timer = 0;
const contact_drop_count_base = 15;
let contact_drop_count = contact_drop_count_base;
let under_block_tf = false;
let mino_min_y = height_num_all;
let hard_tf = false;

//移動
let side_v = 2.5;
let prex = 0;
let move_tf = false;
let multiple = 20;

//Touch
let touch_tf = false;
let one_touch_tf = false;
let touch1_time = 0;
let touch2 = [];
let touch1_pre = [];
let touch_while = [];
let touch_fin_time = 0;
const sens = 0.8;

//Hold
let hold_tf = false;
let hold_mino = '';
let hold_first_tf = false;

//T-Spin
let tspin_rotate_tf = false;
let delete_line_num_for_tspin = 0;

//その他
let finish_tf = false;
let delete_line_num = 0;
let next_draw_num = 5;
const tech_live_time = 1.3;
let tech_text = '';
let tech_timer = 0;
let develop_text = '';

const ver = '1.01.01';






function set_data() {
  //nextミノのListを作成
  let mino_list_k = ['T', 'I', 'L', 'J', 'S', 'Z', 'O'];
  for (let k = 7; 0 < k; k--) {
    mino_list.push(mino_list_k.splice(Math.floor(Math.random() * k), 1)[0])
  }
  //nextnext
  mino_list_k = ['T', 'I', 'L', 'J', 'S', 'Z', 'O'];
  for (let k = 7; 0 < k; k--) {
    mino_list_next.push(mino_list_k.splice(Math.floor(Math.random() * k), 1)[0])
  }


  //フィールドのListを作成
  for (let k = 0; k < height_num_all; k++) {
    let k1 = [];
    for (let k2 = 0; k2 < width_num; k2++) {
      k1.push(0);
    }
    field_all.push(k1.concat());
  }
}
// set_dataを実行
set_data();








//setup関数を実行
function setup() {
  createCanvas(width, height);
  frameRate(fr);
}





// フィールドの背景を描画
function back_draw() {
  //background
  background(0);

  //端
  fill(100);
  rect(left - r, up, r * width_num + 2 * r, r * height_num + r);
  fill(0);
  rect(left, up, r * width_num, r * height_num);


  //方眼
  //横線
  for (let k = 0; k <= height_num + 1; k++) {
    stroke(150)
    line(left - r, up + k * r, left + width_num * r + r, up + k * r);
  }
  //縦線
  for (let k = 0; k <= width_num + 2; k++) {
    line(left + k * r - r, up, left + k * r - r, up + height_num * r + r);
  }
}




//ミノのベースの情報を作成
//A.kind,dirが必要
//list_baseをreturn
function get_mino(kind_k, dir_k) {
  let list_base_k = [];
  let color_k = [0, 0, 0];
  if (kind_k == 'T') {
    list_base_k = [[-1, 0], [0, 0], [1, 0], [0, 1]];
    color_k = [234, 104, 231];
  } else if (kind_k == 'I') {
    list_base_k = [[-2, 0], [-1, 0], [0, 0], [1, 0]];
    color_k = [77, 230, 225];
  } else if (kind_k == 'O') {
    list_base_k = [[0, 0], [0, 1], [1, 0], [1, 1]];
    color_k = [255, 255, 0];
  } else if (kind_k == 'L') {
    list_base_k = [[-1, 0], [0, 0], [1, 0], [1, 1]];
    color_k = [255, 127, 0];
  } else if (kind_k == 'J') {
    list_base_k = [[-1, 1], [-1, 0], [0, 0], [1, 0]];
    color_k = [0, 0, 255];
  } else if (kind_k == 'S') {
    list_base_k = [[-1, 0], [0, 0], [0, 1], [1, 1]];
    color_k = [0, 255, 0];
  } else if (kind_k == 'Z') {
    list_base_k = [[-1, 1], [0, 1], [0, 0], [1, 0]];
    color_k = [255, 0, 0];
  } else {
    alert('Error');
    console.error('func:get_mino:1 kind_kが存在しません。')
  }
  if (list_base_k.length == 0) {
    alert('Error');
    console.error('func:get_mino:2 kind_kが存在しません。')
  }


  if (Amino.kind == 'O') {
    return [list_base_k.concat(), color_k];
  }
  if (dir_k == 'N') {
    return [list_base_k.concat(), color_k];
  } else if (dir_k == 'E') {
    return [list_base_k.map((k) => [k[1], -k[0]]), color_k];
  } else if (dir_k == 'S') {
    return [list_base_k.map((k) => [-k[0], -k[1]]), color_k];
  } else if (dir_k == 'W') {
    return [list_base_k.map((k) => [-k[1], k[0]]), color_k];
  }
  return 'error';
}





//Game終了時の処理
function finish_func() {
  alert('finish');
  noLoop();
}






//ミノの情報を獲得するための関数
function first_func() {
  tspin_rotate_tf = false;
  //Holdの切り替え以外の時
  if (hold_tf == false || hold_first_tf) {
    //nextミノと接続
    now_mino = mino_list.shift();
    mino_list.push(mino_list_next.shift())
    Amino.kind = now_mino;
    if (mino_list_next.length == 0) {
      let mino_list_k = ['T', 'I', 'L', 'J', 'S', 'Z', 'O'];
      for (let k = 7; 0 < k; k--) {
        mino_list_next.push(mino_list_k.splice(Math.floor(Math.random() * k), 1)[0])
      }
    }
  } else {
    Amino.kind = hold_mino;
  }


  //ミノの初期置を決定
  get_mino_k = get_mino(now_mino, 'N');
  if (get_mino_k == 'error') {
    alert('error')
    console.error('Error')
  }
  //Amono.dirの初期値設定
  Amino.dir = 'N';
  //Amino.list_baseの初期値設定
  Amino.list_base = get_mino_k[0];
  //Amino.color決定
  Amino.color = get_mino_k[1];
  //Amino.xの初期値決定
  Amino.x = Math.floor((width_num) / 2 - 2) - Math.min(...Amino.list_base.map((k) => k[0]));
  if (Amino.kind == 'O') Amino.x = Math.floor((width_num) / 2 - 1) - Math.min(...Amino.list_base.map((k) => k[0]));
  //Amono.yの初期値設定
  Amino.y = 17 - Math.min(...Amino.list_base.map((k) => k[0]));
  if (Amino.kind == 'O') Amino.y = 18;
  //Amino.listの初期値s設定
  Amino.list = Amino.list_base.map((k) => [k[0] + Amino.x, k[1] + Amino.y]);

  for (let k = 0; k < Amino.list.length; k++) {
    if (field_all[Amino.list[k][1]][Amino.list[k][0]] != 0) {
      finish_tf = true;
    }
  }
  mino_min_y = height_num_all;
  if (finish_tf) finish_func();
  state = 'fall';
}




//落下時の最初にdataを決定する場所
function fall_set_func() {
  Amino.list = Amino.list_base.map((k) => [k[0] + Amino.x, k[1] + Amino.y]);
}




//落下中のミノを表示
function draw_one_mino() {
  for (let k = 0; k < Amino.list.length; k++) {
    fill(Amino.color[0], Amino.color[1], Amino.color[2]);
    rect(left + Amino.list[k][0] * r, under - Amino.list[k][1] * r - r, r, r);
  }
}




//開始時初回一回のみ実行
function start_func() {
  drop_one_timer = new Date().getTime();
  state = 'first';
}




//落下処理
function fall_func() {
  for (let k = 0; k < Amino.list.length; k++) {
    //最下点に来た場合(床っていうことではない)
    if (Amino.list[k][1] < mino_min_y) {
      mino_min_y = Amino.list[k][1];
      contact_drop_count = contact_drop_count_base;

    }

    //下にブロック(または床)がある場合
    if (Amino.list[k][1] <= 0 || field_all[Amino.list[k][1] - 1][Amino.list[k][0]] != 0) {
      under_block_tf = true;

    }
  }
  if (under_block_tf) {
    under_block_tf = false;
    if (contact_drop_timer == 0) {
      contact_drop_timer = new Date().getTime();
    }
    one_drop_timer = new Date().getTime();
    if (contact_drop_count <= 0) {
      put_func();
      return;
    } else if (new Date().getTime() - contact_drop_timer >= contact_drop_time * 1000) {
      put_func();
      return
    }
  } else {
    contact_drop_timer = 0;
  }

  //one_drop_time秒過ぎた時
  if (1000 * one_drop_time <= new Date().getTime() - one_drop_timer) {
    tspin_rotate_tf = false;
    Amino.y -= 1;
    one_drop_timer = new Date().getTime();
  }
}





//ミノの設置までの猶予を計算する
function put_countdown_func() {
  contact_drop_count -= 1;
  contact_drop_timer = new Date().getTime();
}





function version_draw(){
  fill(255);
  textSize(15);
  textAlign(LEFT);
  text(ver,50,50);
}

//Textを描画
function tech_text_draw() {
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text(String(tech_text), left - 100, up + 10 * r);
  if (new Date().getTime() - tech_timer >= 1000 * tech_live_time) tech_text = '';
}






//開発用のText
function develop_text_draw(){
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text(String(develop_text), left - 100, up + 5 * r);
}



//T-Spin,Tetris,PCを判定
function ttp_func() {
  
  
  
  let tspin_list_string_k = '';
  let delete_num_k = 0;
  let delete_index_k = [];
  let pc_tf_k = true;
  tech_text = "";

  //消すLine数を取得する
  for (let k = 0; k < Amino.list.length; k++) {
    //重複防止&全て埋まっているか
    if (delete_index_k.indexOf(Amino.list[k][1]) == -1 && field_all[Amino.list[k][1]].indexOf(0) == -1) {
      delete_index_k.push(Amino.list[k][1])
      delete_num_k += 1;
    }
  }

  
  for(let k = 0; k < field_all.length; k++){
    //消した行はスキップ
    if(delete_index_k.indexOf(k) != -1) continue;
    //alert(field_all[k].indexOf(0));
    if(field_all[k].filter((k) => k == 0).length != 10) pc_tf_k = false;
  }
    
  if (delete_num_k == 4){
    tech_text = 'Tetris';
  }
  if (pc_tf_k == true){
    if (tech_text != ""){
      tech_text += "\n";
    }
    tech_text += 'Perfect Clear';
  }
  if(tech_text != "") tech_timer = new Date().getTime();

  if (tspin_rotate_tf == false) return;
  
  //Tミノ周りの埋まってるブロックを探す
  if (Amino.x - 1 >= 0) {
    //左上
    if (field_all[Amino.y + 1][Amino.x - 1] != 0) tspin_list_string_k += '[1,-1]';
    //左下
    if (field_all[Amino.y - 1][Amino.x - 1] != 0) tspin_list_string_k += '[-1,-1]';
  } else {
    tspin_list_string_k += '[1,-1][-1,-1]';
  }
  if (Amino.x + 1 < width_num) {
    //右下
    if (field_all[Amino.y - 1][Amino.x + 1] != 0) tspin_list_string_k += '[-1,1]';
    //右上
    if (field_all[Amino.y + 1][Amino.x + 1] != 0) tspin_list_string_k += '[1,1]';
  } else {
    tspin_list_string_k += '[-1,1][1,1]';
  }
  if (Amino.y - 1 < 0){
    tspin_list_string_k += '[-1,-1][-1,1]';
  }





  if (tspin_list_string_k.split(']').length - 1 < 3) return;



  tech_text = 'T-Spin';
  

  if (delete_num_k == 1) {
    tech_text += '\nSingle';
  } else if (delete_num_k == 2) {
    tech_text += '\nDouble';
  } else if (delete_num_k == 3) {
    tech_text += '\nTriple';
  }

  //Mini判定
  if (delete_num_k >= 1 && (Math.abs(T_change_x)) <= 1 && (Math.abs(T_change_y)) <= 1){
    if (Amino.dir == 'N') {
      if (tspin_list_string_k.indexOf('[1,-1]') == -1 || tspin_list_string_k.indexOf('[1,1]') == -1) tech_text += 'Mini';
    } else if (Amino.dir == 'E') {
      if (tspin_list_string_k.indexOf('[1,1]') == -1 || tspin_list_string_k.indexOf('[-1,1]') == -1) tech_text += 'Mini';
    } else if (Amino.dir == 'S') {
      if (tspin_list_string_k.indexOf('[-1,1]') == -1 || tspin_list_string_k.indexOf('[-1,-1]') == -1) tech_text += 'Mini';
    } else if (Amino.dir == 'W') {
      if (tspin_list_string_k.indexOf('[-1,-1]') == -1 || tspin_list_string_k.indexOf('[1,-1]') == -1) tech_text += 'Mini';
    } else {
      console.error('ttp_func:dirが存在しません。');
    }
  }
  
  tech_timer = new Date().getTime();
}

  






//ミノを設置
function put_func() {
  hold_tf = false;
  hold_first_tf = false;
  for (let k = 0; k < Amino.list.length; k++) {
    field_all[Amino.list[k][1]][Amino.list[k][0]] = Amino.color;
  }
  ttp_func();
  state = 'first';
}





//盤面のミノを表示
function mino_all_draw() {
  field = field_all.slice(0, height_num);
  for (let k = 0; k < height_num; k++) {
    for (let k1 = 0; k1 < width_num; k1++) {
      if (field[k][k1] == 0) continue;

      fill(field[k][k1][0], field[k][k1][1], field[k][k1][2]);
      rect(left + r * k1, under - r * k - r, r, r);
    }
  }
}




//SRSを計算
function srs_calc(kind_srs_k, predir_srs_k, dir_srs_k) {
  let list_srs_k = [[]];
  if (kind_srs_k != 'I' || kind_srs_k != 'O') {
    if (dir_srs_k == 'E') {
      list_srs_k = [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]];
    } else if (dir_srs_k == 'W') {
      list_srs_k = [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]];
    } else if (predir_srs_k == 'E') {
      list_srs_k = [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]];
    } else if (predir_srs_k == 'W') {
      list_srs_k = [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]];
    }

  } else if (kind_srs_k == 'O') {
    list_srs_k = [[0, 0]];
  } else { // Iミノ
    if ((predir_srs_k == 'N' && dir_srs_k == 'W') || (predir_srs_k == 'E' && dir_srs_k == 'S')) {
      list_srs_k = [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]];
    } else if ((predir_srs_k == 'E' && dir_srs_k == 'N') || (predir_srs_k == 'S' && dir_srs_k == 'W')) {
      list_srs_k = [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]];
    } else if (predir_srs_k == 'N' && dir_srs_k == 'E') {
      list_srs_k = [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]];
    } else if (predir_srs_k == 'W' && dir_srs_k == 'N') {
      list_srs_k = [[0, 0], [-2, 0], [1, 0], [1, -2], [-2, 1]];
    } else if (predir_srs_k == 'W' && dir_srs_k == 'S') {
      list_srs_k = [[0, 0], [1, 0], [-2, 0], [-2, -1], [1, 2]];
    } else if (predir_srs_k == 'S' && dir_srs_k == 'E') {
      list_srs_k = [[0, 0], [2, 0], [-1, 0], [2, -2], [-2, 1]];
    }
  }
  return list_srs_k;

}





//回転処理に使う関数
function rotate_func(kind_k, dir_k) {
  let list_k = [[]];
  if (kind_k == 'T') {
    //console.log('T')
    list_k = [[-1, 0], [0, 0], [1, 0], [0, 1]];
  } else if (kind_k == 'I') {
    list_k = [[-2, 0], [-1, 0], [0, 0], [1, 0]];
  } else if (kind_k == 'S') {
    list_k = [[-1, 0], [0, 0], [0, 1], [1, 1]];
  } else if (kind_k == 'Z') {
    list_k = [[-1, 1], [0, 1], [0, 0], [1, 0]];
  } else if (kind_k == 'J') {
    list_k = [[-1, 1], [-1, 0], [0, 0], [1, 0]];
  } else if (kind_k == 'L') {
    list_k = [[1, 1], [1, 0], [0, 0], [-1, 0]];
  } else if (kind_k == 'O') {
    list_k = [[0, 1], [1, 1], [1, 0], [0, 0]];
  }
  if (kind_k == 'I') {
    if (dir_k == 'E') list_k = [[0, 2], [0, 1], [0, 0], [0, -1]];
    if (dir_k == 'S') list_k = [[-2, -1], [-1, -1], [0, -1], [1, -1]];
    if (dir_k == 'W') list_k = [[-1, 2], [-1, 1], [-1, 0], [-1, -1]];
    //return
  } else if (kind_k != 'O') {
    for (let k = 0; k < list_k.length; k++) {
      if (dir_k == 'E') {
        list_k[k] = [list_k[k][1], -list_k[k][0]]
      } else if (dir_k == 'S') {
        list_k[k] = [-list_k[k][0], -list_k[k][1]]
      } else if (dir_k == 'W') {
        list_k[k] = [-list_k[k][1], list_k[k][0]]
      }
    }
  }
  return list_k
}




//回転処理
function rotation_func(change_dir) {
  let dir_k = 'N';
  //console.log(change_dir)
  if (change_dir == 'right') {
    if (Amino.dir == 'N') {
      dir_k = 'E';
    } else if (Amino.dir == 'E') {
      dir_k = 'S';
    } else if (Amino.dir == 'S') {
      dir_k = 'W';
    } else if (Amino.dir == 'W') {
      dir_k = 'N';
    } else {
      console.error('rotation_func:Amino.dirでerrorが発生しています。');
    }
  } else if (change_dir == 'left') {
    if (Amino.dir == 'N') {
      dir_k = 'W';
    } else if (Amino.dir == 'W') {
      dir_k = 'S';
    } else if (Amino.dir == 'S') {
      dir_k = 'E';
    } else if (Amino.dir == 'E') {
      dir_k = 'N';
    } else {
      console.error('rotation_func:Amino.dirでerrorが発生しています。');
    }
  }

  let list_base_k = rotate_func(now_mino, dir_k);
  let srs_list_k = srs_calc(now_mino, Amino.dir, dir_k).concat();
  let srs_count = -1;
  for (let k = 0; k < srs_list_k.length; k++) {
    let srs_tf_k = false;
    for (let k1 = 0; k1 < list_base_k.length; k1++) {
      if (Amino.x + list_base_k[k1][0] + srs_list_k[k][0] < 0 || Amino.x + list_base_k[k1][0] + srs_list_k[k][0] >= width_num) {
        srs_tf_k = true;
        break;
      }
      if (Amino.y + list_base_k[k1][1] + srs_list_k[k][1] < 0) {
        srs_tf_k = true;
        break;
      }
      if (field_all[Amino.y + list_base_k[k1][1] + srs_list_k[k][1]][Amino.x + list_base_k[k1][0] + srs_list_k[k][0]] != 0) {
        srs_tf_k = true;
        break;
      }

    }
    if (srs_tf_k) continue;
    srs_count = k;
    break;
  }
  if (srs_count != -1) {
    Amino.list_base = list_base_k.concat();
    T_change_x = srs_list_k[srs_count][0];
    T_change_y = srs_list_k[srs_count][1];
    Amino.x += srs_list_k[srs_count][0];
    Amino.y += srs_list_k[srs_count][1];
    Amino.dir = dir_k;
    if (now_mino == 'T') tspin_rotate_tf = true;
    put_countdown_func();
  }
}




//Textを描画
function text_draw() {
  fill(255);
  textSize(20);
  textAlign(CENTER);
  text(String(delete_line_num), left - 100, up);
}





//Lineを消す
function delete_line() {
  let line_k = [];
  for (let k = field_all.length - 1; k >= 0; k--) {
    if (field_all[k].indexOf(0) == -1) {
      line_k.push(k);
    }
  }
  let k_empty = [];
  for (let k0 = 0; k0 < width_num; k0++) {
    k_empty.push(0);
  }

  for (k of line_k) {
    delete_line_num += 1;
    field_all.splice(k, 1);
    field_all.push(k_empty.concat());
  }
}






//Hold
function hold_func() {
  if (hold_tf) return
  hold_tf = true;

  if (hold_mino != '') {
    now_mino = hold_mino;
  } else {
    hold_first_tf = true;
  }
  hold_mino = Amino.kind;
  state = 'first';
}






//北向きのミノ一つを描画する関数
function mino_one_draw(left_k, up_k, kind_k) {
  let list_base_k = [[]];
  let color_k = [];

  if (kind_k == 'T') {
    list_base_k = [[-1, 0], [0, 0], [1, 0], [0, 1]];
    color_k = [234, 104, 231];
  } else if (kind_k == 'I') {
    list_base_k = [[-2, 0], [-1, 0], [0, 0], [1, 0]];
    color_k = [77, 230, 225];
  } else if (kind_k == 'O') {
    list_base_k = [[0, 0], [0, 1], [1, 0], [1, 1]];
    color_k = [255, 255, 0];
  } else if (kind_k == 'L') {
    list_base_k = [[-1, 0], [0, 0], [1, 0], [1, 1]];
    color_k = [255, 127, 0];
  } else if (kind_k == 'J') {
    list_base_k = [[-1, 1], [-1, 0], [0, 0], [1, 0]];
    color_k = [0, 0, 255];
  } else if (kind_k == 'S') {
    list_base_k = [[-1, 0], [0, 0], [0, 1], [1, 1]];
    color_k = [0, 255, 0];
  } else if (kind_k == 'Z') {
    list_base_k = [[-1, 1], [0, 1], [0, 0], [1, 0]];
    color_k = [255, 0, 0];
  } else {
    alert('Error');
    console.error('func:get_mino:1 kind_kが存在しません。')
  }
  if (list_base_k.length == 0) {
    alert('Error');
    console.error('func:get_mino:2 kind_kが存在しません。')
  }

  for (let k = 0; k < list_base_k.length; k++) {
    fill(color_k[0], color_k[1], color_k[2]);
    rect(left_k + list_base_k[k][0] * r + 2 * r, up_k - list_base_k[k][1] * r + 4 * r, r, r);
  }

}





//Nextミノを表示
function next_mino_draw() {
  for (let k = 0; k < next_draw_num; k++) {
    mino_one_draw(left + width_num * r + 2 * r, up - 2 * r + 4 * k * r, mino_list[k])
  }
}




//Holdミノを表示
function hold_mino_draw() {
  if (hold_mino == '') return;
  mino_one_draw(left - 6 * r, up - 2 * r, hold_mino);
}




//HardDrop
function hard_func() {
  if (hard_tf) return;
  if (state != 'fall') return;
  if(new Date().getTime() - (touch1_time + touch_fin_time) <= 90) return;
  for (let k1 = 0; true; k1++) {
    for (let k = 0; k < Amino.list_base.length; k++) {
      if (Amino.y + Amino.list_base[k][1] - k1 <= 0) {
        for (let k2 = 0; k2 < Amino.list_base.length; k2++) {
          Amino.list[k2] = [Amino.list[k2][0], Amino.y + Amino.list_base[k2][1] - k1];
        }
        //tspin_rotate_tf = false;
        hard_tf = true;
        put_func();
        return;
      }
      if (field_all[Amino.y + Amino.list_base[k][1] - k1 - 1][Amino.x + Amino.list_base[k][0]] != 0) {
        for (let k2 = 0; k2 < Amino.list_base.length; k2++) {
          Amino.list[k2] = [Amino.list[k2][0], Amino.y + Amino.list_base[k2][1] - k1];
        }
        hard_tf = true;
        put_func();
        return;
      }
    }
  }
}






//指を動かした時の特殊操作
function move_finger_func() {
  if (move_tf == false) return;
  if (touch_while.length != 0) {
    if (touch_fin_time != 0) {
      if (touch_fin_time <= 150 && touch_while[0].y - touch1_pre[0].y >= 120*sens) {
        hard_func();
        return;
      }
      touch_fin_time = 0;
    }
  }

  if (touch2.length == 0) return;


  if (new Date().getTime() - touch1_time <= 200 && touch1_pre[0].y - touch2[0].y >= 50*sens && Math.abs((touch2[0].x - touch1_pre[0].x) / (touch2[0].y - touch1_pre[0].y)) <= 1) {
    hold_func();
    return;
  } else if (touch2[0].y - touch1_pre[0].y >= 70*sens) {
    one_drop_time = one_drop_time_base / multiple;
    return;
  }

}







//draw関数とほぼ同じ
function draw_main() {
  back_draw();
  //最初一回だけ実行
  if (state == 'start') {
    start_func();
  }

  delete_line();

  //versionを描画
  version_draw();
  //Textを描画
  text_draw();
  //TechTextを描画
  tech_text_draw();
  //開発用のText
  /*develop_text = tspin_rotate_tf;
  develop_text_draw();*/
  //盤面のミノを表示
  mino_all_draw()
  //Holdミノを表示
  hold_mino_draw();
  //Nextミノを表示
  next_mino_draw();

  //状態による場合分け

  if (state == 'first') {
    first_func();
  } else if (state == 'fall') {
    fall_set_func();
    draw_one_mino();
  }


  //移動時の特殊関数
  move_finger_func();
  //落下処理
  fall_func();
  one_drop_time = one_drop_time_base;
  




  //回転処理(短いタッチ)
  if (one_touch_tf) {
    try {
      one_touch_tf = false;
      if (touch1_pre[0].x >= width / 2) {
        rotation_func('right');
      } else {
        rotation_func('left');
      }
    } catch (error_k) {
      alert('one_touch:error:' + error_k);
    }
  }




}




//Touchした時
function touchStarted() {
  touch_tf = true;
  //touch1を設定
  touch1 = touches.concat();
  touch1_time = new Date().getTime();

  //one_touchに使うtouch1_preを設定
  if (touches.length != 0) touch1_pre = touches;

  //moveに使うprexを設定
  prex = Amino.x;
  move_tf = false;
}




//指を動かした時
function touchMoved() {
  move_tf = true;
  if (touches.length != 0) touch2 = touches.concat();
  touch_while = touches.concat();



  if (Math.abs((touches[0].x - touch1[0].x) / (touches[0].y - touch1[0].y)) >= 2 || new Date().getTime() - touch1_time > 200) {
    let k_x = prex + Math.floor(side_v * width_num * (touches[0].x - touch1[0].x) / width);
    let k_x_tf = true;
    for (let k = 0; k < Amino.list_base.length; k++) {
      if (k_x + Amino.list_base[k][0] < 0 || k_x + Amino.list_base[k][0] >= width_num) k_x_tf = false;

      //動く予定の場合
      if (k_x != Amino.x) {
        for (let k1 = 0; k1 <= Math.abs(k_x - Amino.x); k1++) {
          if (field_all[Amino.y + Amino.list_base[k][1]][Math.min(Amino.x, k_x) + k1 + Amino.list_base[k][0]]) k_x_tf = false;
        }
      } else { //動かない予定の場合
        k_x_tf = false;
      }

    }
    if (k_x_tf) {
      tspin_rotate_tf = false;
      Amino.x = k_x;
      for (let k = 0; k < Amino.list_base.length; k++) {
        if (Amino.y + Amino.list_base[k][1] <= 0) {
          put_countdown_func();
          break;
        }
        if (field_all[Amino.y + Amino.list_base[k][1] - 1][Amino.x + Amino.list_base[k][0]] != 0) {
          put_countdown_func();
          break;
        }
      }
    }
  }

  touch_tf = false;
}




//指を離した時
function touchEnded() {
  hard_tf = false;
  if (touch_tf) one_touch_tf = true;
  touch2 = touches.concat();
  touch_tf = false;
  touch_fin_time = new Date().getTime() - touch1_time;
}



//条件分岐のためdraw_mainと分けたやつ
function draw() {
  clear();
  draw_main();
}
