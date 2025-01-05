const canvas = document.getElementById('canvas');

const w = innerWidth;
const h = innerHeight;

canvas.width = w;
canvas.height = h;

canvas.style.background = '#f0f0f0';

const id_ctx = CompVis._create_canvas(canvas);

const interval = 0.2;

let point = [0,0];

let one_two = 1;

let p1 = [];
let P1 = [];

let touch_tf = false;

canvas.addEventListener('touchmove',(event) => {
  event.changedTouches[0].pageX;
  touch_tf = true;
},false);

canvas.addEventListener('touchend',(event) => {
  one_two = 1-one_two;
},false);

function point_draw(l){
  for(let k = 0; k < l.length; k++){
    CompVis._graph(id_ctx,function(t){
      return new CompVis(0,2*Math.PI*t).exp.add(CompVis._toComp(l[k])).pro(10);
    },0,1,0.01);
  }
}

setInterval(() => {
  if(touch_tf){
    if(one_two == 1){
      p1.push(structuredClone(point));
      point_draw(p1);
    } else {
      p2.push(structuredClone(point));
      point_draw(p2);
    }
    touch_tf = false;
  }
},parseInt(interval*1000));
