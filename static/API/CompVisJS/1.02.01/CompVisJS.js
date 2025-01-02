//For more information on the _graph method, see <https://makeplayonline.onrender.com/Static/API/CompVisJS/1.01.01/explanation.txt>.

class CompVis {
  constructor(k_real, k_imag) {
    this._real = k_real;
    this._imag = k_imag;
  }
  
  static _list_ja = ['real:実部を取得','imag:虚部を取得','value:値を配列で取得[real,imag]','conj:共役な複素数','abs:絶対値','arg:偏角','log:自然対数','log_n:引数を底とした対数','exp:eを底とした累乗','toComp:二次元配列を複素数値に','add:足し算','dif:引き算','pro:掛け算','div:割り算','pow_by:引数乗','pow_of:引数を底とした累乗','rotate:引数[rad]反時計回りに回転させる']
  static _list = ['real:get real part','imag:get imaginary part','value:get value as array[real,imag]','conj:conjugate complex number','abs:absolute value','arg:partial angle','log:natural logarithm','log_n:logarithm with argument as base','exp:power with e as base ','toComp:two-dimensional array to complex numbers','add:addition','dif:subtraction','pro:multiplication','div:division','pow_by:argument power','pow_of:power with argument at bottom','rotate:rotate argument[rad]counterclockwise']
  
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
    return new CompVis(k[0],k[1]);
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
  
  //default:width=0,height=0,thick=1,radius=0,line_color="#000",point_color="#a00000",timeout=20000
  static _graph(id,origin_func,start,end,step,params={}){
    let width = 0;
    let height = 0;
    let thick = 1;
    let radius = 0;
    let line_color = "#000";
    let point_color = "#a00000";
    let timeout = 20000;
    
    //setting
    for(let k of Object.keys(params)){
      let value_k = params[k];
      switch(k){
        case 'width':
          width = value_k;
          break;
        case 'height':
          height = value_k;
          break;
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
      }
    }
    
    if(width > 0){
      id.width = width;
    } else {
      id.width = window.innerWidth;
    }
    if(height > 0){
      id.height = height;
    } else {
      id.height = window.innerHeight;
    }
    
    
    const ctx = id.getContext("2d");
    ctx.strokeStyle = line_color;
    ctx.fillStyle = point_color;
    ctx.lineWidth = thick;
    const center_x = id.width/2;
    const center_y = id.height/2;
    
    function func(t){
      return origin_func(t).add(new CompVis(center_x,center_y));
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
    
    if(start+step <= end){
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
};
