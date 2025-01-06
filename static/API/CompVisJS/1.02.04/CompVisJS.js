//For more information on the _graph method, see <https://makeplayonline.onrender.com/Blog/Contents/API/CompVisJS/explanation>.

class CompVis {
  constructor(k_real, k_imag) {
    this._real = k_real;
    this._imag = k_imag;
  }
  
  static ver = '1.02.04';
  static _list = ['.value','_value','.str','_str','.round','_round','_toComp','.real','.imag','.conj','.abs','.arg','.log','.exp','_create_canvas','_graph','_DFT','_Real','_Imag','.add','.dif','.pro','.div','.log_n','.pow_by','.pow_of','.rotate'];
  
  //Methods that throw errors about functions whose arguments must be real numbers
  #Error_Argument_real(k){
    if(isNaN(k)){
      throw new Error('CompVisJS-Argument error->The argument of this method must be a real number.')
    }
  }
  
  
  get value(){
    return [this._real,this._imag];
  }
  static _value(k){
    if(Array.isArray(k)){
      let list_k = [];
      for(let k_k = 0; k_k < k.length; k_k++){
        list_k.push(k[k_k].value);
      }
      return list_k;
    } else{
      return k.value;
    }
  }
  
  get #mini_str(){
    let k;
    if(this._real == 0){
      if(this._imag == 0){
        k = "0";
      } else {
        k = String(this._imag)+"i";
      }
    } else {
      k = String(this._real);
      if(this._imag > 0){
        k += "+"+String(this._imag)+"i";
      } else if(this._imag < 0){
        k += String(this._imag)+"i";
      }
    }
    return k;
  }
  get str(){
    return CompVis._str(this);
  }
  static _str(k){
    if(Array.isArray(k)){
      let list_k = [];
      for(let k_k = 0; k_k < k.length; k_k++){
        list_k.push(k[k_k].#mini_str);
      }
      return list_k;
    } else {
      return k.#mini_str;
    }
  }
  
  round(k=0){
    let k_k;
    if(k >= 0){
      k_k = new CompVis(this._real.toFixed(k),this._imag.toFixed(k));
    } else {
      k_k = new CompVis(Math.round(this._real*10**k)/10**k,Math.round(this._imag*10**k)/10**k)
    }
    return k_k;
  }
  static _round(value_k,k=0){
    if(Array.isArray(value_k)){
      let list_k = [];
      for(let ind_k = 0; ind_k < value_k.length; ind_k++){
        list_k.push(value_k[ind_k].round(k));
      }
      return list_k;
    } else {
      return value_k.round(k);
    }
  }
  
  #RtoI(k){
    if(!isNaN(k)){
      k = new CompVis(k,0);
    }
    return k;
  }
  
  static _toComp(k){
    if(Array.isArray(k[0])){
      return k.map((j) => {
        return new CompVis(j[0],j[1]);
      })
    } else {
      return new CompVis(k[0],k[1]);
    }
  }
  
  get real(){
    return this._real;
  }
  get imag(){
    return this._imag;
  }
  get conj(){
    return new CompVis(this._real,-this._imag);
  }
  get abs(){
    return Math.sqrt(this._real*this._real+this._imag*this._imag);
  }
  get arg(){
    return Math.atan2(this._imag,this._real);
  }
  get log(){
    return new CompVis(Math.log(this.abs),this.arg);
  }
  get exp(){
    return new CompVis(Math.cos(this._imag),Math.sin(this._imag)).pro(Math.exp(this._real));
  }
  
  static _create_canvas(canvas,width=0,height=0){
    if(width > 0){
      canvas.width = width;
    }
    if(height > 0){
      canvas.height = height;
    }
    return {canvas:canvas,ctx:canvas.getContext("2d"),width:canvas.width,height:canvas.height};
  }
  //default:thick=1,radius=0,line_color="#000",point_color="#a00000",timeout=20000
  static _clear_canvas(canvas_ctx){
    const ctx = canvas_ctx.ctx;
    const canvas = canvas_ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // キャンバスをクリア
  }
  
  static _graph(canvas_ctx, func, start, end, step, params={}) {
    let color = 'black';
    let line_width = 2;
    let size = 1;
    for(let k of Object.keys(params)){
      let value_k = params[k];
      switch(k){
        case 'color':
          color = value_k;
          break;
        case 'line_width':
          line_width = value_k;
          break;
        case 'size':
          size = value_k;
          break;
      }
    } 
    const ctx = canvas_ctx.ctx;
    const canvas = canvas_ctx.canvas;
    ctx.beginPath();

    // グラフの描画を開始
    for (let t = start; t < end; t += step) {
      if(t+step > end) t = end;
      const [x, y] = func(t).value;
      
      const canvasX = canvas.width / 2 + x * size; // スケールとオフセット
      const canvasY = canvas.height / 2 - y * size; // Y 軸の方向を反転
      if (t === start) {
        ctx.moveTo(canvasX, canvasY);
      } else {
        ctx.lineTo(canvasX, canvasY);
      }
    }

    ctx.strokeStyle = color; // 線の色
    ctx.lineWidth = line_width; // 線の太さ
    ctx.stroke();
  }
  
  static _draw_text(canvas_ctx,text,c,params={}){
    let px = 18;
    let max_width = -1;
    let color = 'black';
    let ctx = canvas_ctx.ctx;
    let canvas = canvas_ctx.canvas;
    let align = 'start';
    for(let k of Object.keys(params)){
      let value_k = params[k];
      switch(k){
        case 'px':
          px = value_k;
          break;
        case 'max_width':
          max_width = value_k;
          break;
        case 'color':
          color = value_k;
          break;
        case 'align':
          align = value_k;
          break;
      }
    }
    
    //canvasと同じサイズのdivを作成する
    let div;
    if(document.getElementById("text_div") == null){
      div = document.createElement('div');
      div.setAttribute('id', 'text_div');
      let body = document.getElementsByTagName('body')[0];
      body.appendChild(div);
    } else {
      div = document.getElementById('text_div');
    }
    const canvasRect = canvas.getBoundingClientRect(); // canvas の位置とサイズを取得

    //text_spanを削除
    while (div.firstChild) {
      div.removeChild(div.firstChild);
    }
    // div を canvas に一致させる
    div.style.position = 'absolute';
    div.style.top = `${canvasRect.top}px`;
    div.style.left = `${canvasRect.left}px`;
    div.style.width = `${canvasRect.width}px`;
    div.style.height = `${canvasRect.height}px`;
    let text_span = document.createElement('span');
    text_span.textContent = text;
    text_span.style.position = 'absolute';
    text_span.style.left = String(c.real) + 'px';
    text_span.style.top = String(c.imag) + 'px';
    text_span.style.textAlign = 'center';  // 文字をセンタリング
    text_span.style.background = 'red'
    
    let translateX = '0';
    let translateY = '0';

    // alignによる位置調整
    switch (align) {
      case 'bottom-left':
        translateY = '-100%';
        break;
      case 'center':
        translateX = '-50%';
        translateY = '-50%';
        break;
      case 'top-right':
        translateX = '-100%';
        break;
      case 'bottom-right':
        translateX = '-100%';
        translateY = '-100%';
        break;
    }
    text_span.style.transform = `translate(${translateX}, ${translateY})`;
    
    div.appendChild(text_span);
  }
  
  static _DFT(l,return_type='normal'){
    if(return_type != 'normal' && return_type != 'text_list') throw new Error("CompVisJS-Argument error->The second argument of the DFT method must be either 'normal' or 'text_list'.");
    let N = l.length;
    let abs = [];
    let arg = [];
    let return_value = [];
    let F = [];
    for(let k = 0; k < N; k++){
      F.push(new CompVis(0,0));
    
      for(let j = 0; j < N; j++){
        F[k] = F[k].add(new CompVis(0,1).pro(-2*Math.PI*j*k/N).exp.pro(l[j]));
      }
      F[k] = F[k].div(N);
      if(return_type == 'normal') {
        return_value.push({value:F[k],abs:F[k].abs,arg:F[k].arg});
      } else {
        return_value.push(`value:${F[k].str},abs:${F[k].abs},arg:${F[k].arg}`);
      }
    }
    return return_value;
  }
  static _Real(k){
    if(!Array.isArray(k)){
      return k.real;
    } else {
      return k.map((j) => {
        return j.real;
      });
    }
  }
  static _Imag(k){
    if(!Array.isArray(k)){
      return k.imag;
    } else {
      return k.map((j) => {
        return j.imag;
      });
    }
  }
  
  
  add(k){
    k = this.#RtoI(k);
    return new CompVis(this._real+k.real,this._imag+k.imag);
  }
  dif(k){
    k = this.#RtoI(k);
    return new CompVis(this._real-k.real,this._imag-k.imag);
  }
  pro(k){
    k = this.#RtoI(k);
    return new CompVis(this._real*k.real-this._imag*k.imag,this._real*k.imag+this._imag*k.real);
  }
  div(k){
    k = this.#RtoI(k);
    let k_k = this.pro(k.conj);
    let k_abs2 = k.abs*k.abs;
    return new CompVis(k_k.real/k_abs2,k_k.imag/k_abs2);
  }
  log_n(k){
    this.#Error_Argument_real(k);
    return new CompVis(Math.log(this.abs)/Math.log(k),this.arg/Math.log(k));
  }
  pow_by(k){
    k = this.#RtoI(k);
    let k_k = k.pro(this.log);
    return k_k.exp;
  }
  pow_of(k){
    k = this.#RtoI(k);
    let k_k = this.pro(k.log);
    return k_k.exp;
  }
  rotate(k){
    this.#Error_Argument_real(k);
    k = new CompVis(0,1).pro(k).exp;
    return this.pro(k);
  }
}
