let touch_list = [];
let touch_num = 0;
const w = window.innerWidth;
const h = window.innerHeight;

/*let morse_img_id = document.getElementById("morse_img").style

morse_img_id.height = h/2-300;
morse_img_id.left = (w-morse_img_id.width)/2;
console.log(morse_img_id.left)*/


let color_num = 200;
let button_color = [color_num,0,0];

let BPM_id = document.getElementById('BPM');
//一分で何回か
let BPM = 120;
if(localStorage.getItem('BPM') != null){
  BPM = parseInt(localStorage.getItem('BPM'));
  BPM_id.value = String(BPM);
}
//何秒で一回か
let bpm = 60/BPM;

function inputInput(){
  // イベントが発生した時の処理
  BPM = BPM_id.value;
  bpm = 60/BPM;
  document.getElementById('show').innerText = String(BPM);
}

function inputChange(){
  localStorage.setItem("BPM",String(BPM));
}

BPM_id.addEventListener('input', inputInput);
BPM_id.addEventListener('change', inputChange);

BPM = BPM_id.value;
bpm = 60/BPM;
document.getElementById('show').innerText = String(BPM);

//サイトが開いた時の時間
let start = Date.now();
//タッチした時の時間
let time_start = 0;
//タッチしていた時間
let time_while = 0;
//タッチしなくなった時の時間
let time_none_start = 0;
//タッチしなかった時間
let time_nonw_while = 0;
//タッチしているか
let Push_tf = false;
//モールスの符号
let Text = "";

let trans_Text = "";
//短点何個分か
let times_num = 0;


const Morsecode_en = ["01","1000","1010","100","0","0010","110","0000","00","0111","101","0100","11","10","111","0110","1101","010","000","1","001","0001","011","1001","1011","1100","01111","00111","00011","00001","00000","10000","11000","11100","11110","11111"]
const morsecode_en = Morsecode_en.map((k) => {
  return k.replaceAll("0","•").replaceAll("1","-")
})
console.log(morsecode_en)
const en = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0"]


const textarea_id = document.getElementById("textarea");

textarea_id.style.height = h/2-200;

addEventListener("error", (k) => {alert(k.message)});

document.addEventListener('touchstart',  (e)=>{
  touch_list = [];
  touch_num = e.touches.length;
  for(let k of e.touches){
    touch_list.push([k.clientX,k.clientY]);
  }
});

document.addEventListener('touchmove',  (e)=>{
  touch_list = [];
  for(let k of e.touches){
    touch_list.push([k.clientX,k.clientY]);
  }
});

document.addEventListener('touchend',  (e)=>{
  touch_list = [];
  touch_num = e.touches.length;
  for(let k of e.touches){
    touch_list.push([k.clientX,k.clientY]);
  }
});

function Push(){
  if(time_none_start != 0){
    time_none_while = (Date.now()-time_none_start)/1000;
    if(time_none_while < 2*bpm){
      
    } else if(time_none_while < 5*bpm) {
      Text += " ";
    } else {
      Text += "\n";
    }
  }
  time_start = Date.now();
  Push_tf = true;
}

function Pull(){
  time_while = (Date.now()-time_start)/1000;
  if(time_while < bpm){
    Text += "•";
  } else {
    Text += "-";
  }
  Push_tf = false;
  time_none_start = Date.now();
}

function setup(){
  createCanvas(w,h)
}

function draw(){
  clear();
  background(0);
  if((Date.now()-start) % (1000*bpm) < bpm*200){
    fill(255,255,0);
    ellipse(w/2,h/2,10,10);
  }
  if(time_start > 0){
    if(Push_tf){
      times_num = parseInt((Date.now()-time_start)/(bpm*1000));
    } else {
      times_num = parseInt((Date.now()-time_none_start)/(bpm*1000));
    }
    fill(255);
    textAlign(CENTER);
    text(String(times_num), w/2, h/2);
  }
  if(touch_num >= 1){
    //タッチ場所を表示
    fill(255);
    ellipse(touch_list[0][0],touch_list[0][1],10,10);

    //鍵盤
    if(touch_list[0][0] >= w/2-100 && touch_list[0][0] <= w/2+100 && touch_list[0][1] >= h/2+100 && touch_list[0][1] <= h/2+300){
      button_color = [color_num,color_num,0];
      if(Push_tf == false){
        Push();
      }
    } else {
      if(Push_tf){
        Pull();
      }
      button_color = [color_num,0,0];
    }

    //文字列を削除
    if(((touch_list[0][0])-w/4+50)**2+(touch_list[0][1]-h/2-200)**2 < (Math.min(w/2-150,100))**2){

      //変数を初期化
      
      //サイトが開いた時の時間
      start = Date.now();
      //タッチした時の時間
      time_start = 0;
      //タッチしていた時間
      time_while = 0;
      //タッチしなくなった時の時間
      time_none_start = 0;
      //タッチしなかった時間
      time_nonw_while = 0;
      //タッチしているか
      Push_tf = false;
      //モールスの符号
      Text = "";

      trans_Text = "";
      //短点何個分か
      times_num = 0;
      //Text = "";
    }
  } else {
    if(Push_tf){
      Pull();
    }
    button_color = [color_num,0,0];
  }
  fill(button_color[0],button_color[1],button_color[2]);
  rect(w/2-100,h/2+100,200,200);

  
  fill(0,150,0);
  ellipse(w/4-50,h/2+200,2*Math.min(w/4-75,100),2*Math.min(w/4-75,100));

  //翻訳(符号→アルファベット)
  if(Text != ""){
    let trans_Text_k = [];
    //符号の文を分割して、それぞれ翻訳する
    for(let k of Text.split(/ |\n/g)){
      if(morsecode_en.indexOf(k) != -1){
        trans_Text_k.push(en[morsecode_en.indexOf(k)])
      } else {
        trans_Text_k.push("??");
      }
    }

    //分割したものを戻す
    trans_Text = "";
    let k0 = [...Text.matchAll(/ |\n/g)];
    if(k0 != null){
      for(let k = 0; k < k0.length; k++){
        
        trans_Text += trans_Text_k[k]+k0[k];
      }
      console.log(trans_Text)
      if(trans_Text_k.length > k0.length){
        trans_Text += trans_Text_k[k0.length];
      }
    } else {
      trans_Text += trans_Text_k[0];
    }
  }

  
  textarea_id.value = trans_Text;
  textSize(20);
  fill(255);
  textAlign(CENTER);
  text(String(Text).replaceAll('\n','   '), w/2, h/2-100);
}
