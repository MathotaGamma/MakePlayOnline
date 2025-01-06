//For more information on the _graph method, see <https://makeplayonline.onrender.com/Blog/Contents/API/CompVisJS/explanation>.

class CompVis {
  constructor(k_real, k_imag) {
    this._real = k_real;
    this._imag = k_imag;
  }
  
  static ver = '1.02.03';
  static _list = ['.value','_value','.str','_str','.round','_round','_toComp','.real','.imag','.conj','.abs','.arg','.log','.exp','_create_canvas','_graph','_re_graph','_DFT','_Real','_Imag','.add','.dif','.pro','.div','.log_n','.pow_by','.pow_of','.rotate'];
  
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
  static _graph(canvas_ctx,origin_func,start,end,step,params={}){
    const return_data = {canvas_ctx:canvas_ctx,origin_func:origin_func,start:start,end:end,step:step,params:params}
    let canvas = canvas_ctx.canvas;
    //console.log(canvas)
    let ctx = canvas_ctx.ctx;
    let thick = 1;
    let radius = 0;
    let center_x = canvas.width/2;
    let center_y = canvas.height/2;
    let line_color = "#000";
    let point_color = "#a00000";
    let timeout = 20000;
    
    //setting
    for(let k of Object.keys(params)){
      let value_k = params[k];
      switch(k){
        case 'thick':
          thick = value_k;
          break;
        case 'radius':
          radius = value_k;
          break;
        case 'line_color':
          line_color = value_k;
          break;
        case 'point_color':
          point_color = value_k;
          break;
        case 'timeout':
          timeout = value_k;
          break;
        case 'origin':
          if(value_k == 'normal'){
            center_x = 0;
            center_y = canvas.height;
          }
      }
    }
    
    
    ctx.strokeStyle = line_color;
    ctx.fillStyle = point_color;
    ctx.lineWidth = thick;
    
    
    function func(t){
      return new CompVis(center_x,center_y).add(origin_func(t).conj);
    }
    
    if(Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(step)){
      throw new Error('CompVisJS-Argument error->The arguments start, end and step of the _graph method must be real numbers.');
    }
    if(start > end || step <= 0){
      throw new Error('CompVisJS-Argument error->The argument of the _graph method, end, must be a number greater than start, and step must be greater than or equal to 0.');
    }
    
    
    let t = start;
    
    let value = func(t).value;
    
    
    ctx.beginPath();
    ctx.arc(value[0],value[1],radius,0,2*Math.PI);
    ctx.closePath();
    ctx.fill();
   
    if(start + step < end){
      let start_time = Date.now();
      
      while(t < end){
        ctx.beginPath();
        
        value = func(t).value;
        ctx.moveTo(value[0],value[1]);
        
        t += step;
        if(t > end){
          t = end;
        }
        value = func(t).value;
        ctx.lineTo(value[0],value[1]);
        
        ctx.closePath();
        ctx.stroke();
        
        
        ctx.beginPath();
        ctx.arc(value[0],value[1],radius,0,2*Math.PI);
        ctx.closePath();
        ctx.fill();
        
        if(timeout > 0 && Date.now()-start_time > timeout){
          
throw new Error('CompVisJS-Timeout error->Too long.');
          break;
        }
      }
    }
    
    return return_data;
  }
  
  static _re_graph(data_list){
    if(!Array.isArray(data_list)) data_list = [data_list];
    let canvas_k = data_list[0].canvas_ctx.canvas;
    let canvas_ctx = CompVis._create_canvas(canvas_k,canvas_k.width,canvas_k.height);
    for(let data of data_list){
      let canvas = canvas_ctx.canvas;
      let ctx = canvas_ctx.ctx;
      let origin_func = data.origin_func;
      let start = data.start;
      let end = data.end;
      let step = data.step;
      let params = data.params;
      let thick = 1;
      let radius = 0;
      let center_x = canvas.width/2;
      let center_y = canvas.height/2;
      let line_color = "#000";
      let point_color = "#a00000";
      let timeout = 20000;
      
      //setting
      for(let k of Object.keys(params)){
        let value_k = params[k];
        switch(k){
          case 'thick':
            thick = value_k;
            break;
          case 'radius':
            radius = value_k;
            break;
          case 'line_color':
            line_color = value_k;
            break;
          case 'point_color':
            point_color = value_k;
            break;
          case 'timeout':
            timeout = value_k;
            break;
          case 'origin':
            if(value_k == 'normal'){
              center_x = 0;
              center_y = canvas.height;
            }
        }
      }
    
      ctx.strokeStyle = line_color;
      ctx.fillStyle = point_color;
      ctx.lineWidth = thick;
      
    
      function func(t){
        return new CompVis(center_x,center_y).add(origin_func(t).conj);
      }
    
      if(Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(step)){
        throw new Error('CompVisJS-Argument error->The arguments start, end and step of the _graph method must be real numbers.');
      }
      if(start > end || step <= 0){
        throw new Error('CompVisJS-Argument error->The argument of the _graph method, end, must be a number greater than start, and step must be greater than or equal to 0.');
      }
    
    
      let t = start;
    
      let value = func(t).value;
    
      ctx.beginPath();
      ctx.arc(value[0],value[1],radius,0,2*Math.PI);
      ctx.closePath();
      ctx.fill();
    
      if(start + step <= end){
        let start_time = Date.now();
      
        while(t < end){
          ctx.beginPath();
        
          value = func(t).value;
          ctx.moveTo(value[0],value[1]);
        
          t += step;
          if(t > end){
            t = end;
          }
          value = func(t).value;
          ctx.lineTo(value[0],value[1]);
        
          ctx.closePath();
          ctx.stroke();
        
        
          ctx.beginPath();
          ctx.arc(value[0],value[1],radius,0,2*Math.PI);  
          ctx.closePath();
          ctx.fill();
        
          if(timeout > 0 && Date.now()-start_time > timeout){
          
throw new Error('CompVisJS-Timeout error->Too long.');
            break;
          }
        }
      }
    }
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
