class Complex {
  constructor(k_real, k_imag) {
    this._real = k_real;
    this._imag = k_imag;
  }
  static list = ['real:実部を取得','imag:虚部を取得','value:値を配列で取得[real,imag]','conj:共役な複素数','abs:絶対値','arg:偏角','log:自然対数','log_n:引数を底とした対数','exp:eを底とした累乗','set:値を設定','add:足し算','dif:引き算','pro:掛け算','div:割り算','pow_by:引数乗','pow_of:引数を底とした累乗','rotate:引数[rad]反時計回りに回転させる']
  //実部を取得
  get real(){
    return this._real;
  }
  //虚部を取得
  get imag(){
    return this._imag;
  }
  //thisの値を配列で取得[real,imag]
  get value(){
    return [this._real,this._imag];
  }
  //thisの共役な複素数
  get conj(){
    return new Complex(this._real,-this._imag);
  }
  //|this|
  get abs(){
    return Math.sqrt(this._real*this._real+this._imag*this._imag);
  }
  //arg(this)
  get arg(){
    return Math.atan2(this._imag,this._real);
  }
  //log_e(this)
  get log(){
    return new Complex(Math.log(this.abs),this.arg);
  }
  //e^this
  get exp(){
    return new Complex(Math.cos(this._imag),Math.sin(this._imag)).pro(Math.exp(this._real));
  }
  //引数が実数でないといけない関数に関するエラーを投げるメソッド
  #Error_Argument_real(k){
    if(isNaN(k)){
      throw new Error('Complex-Argument error->The argument of this method must be a real number.')
    }
  }
  //変数の値をセットする
  set(k){
    this._real = k.real;
    this._imag = k.imag;
  }
  //実数を複素数に変換
  #RtoI(k){
    if(!isNaN(k)){
      k = new Complex(k,0);
    }
    return k;
  }
  //this+k
  add(k){
    this.#RtoI(k);
    return new Complex(this._real+k.real,this._imag+k.imag);
  }
  //this-k
  dif(k){
    this.#RtoI(k);
    return new Complex(this._real-k.real,this._imag-k.imag);
  }
  //this*k
  pro(k){
    k = this.#RtoI(k);
    return new Complex(this._real*k.real-this._imag*k.imag,this._real*k.imag+this._imag*k.real);
  }
  //this/k
  div(k){
    this.#RtoI(k);
    let k_k = this.pro(k.conj);
    let k_abs2 = k.abs*k.abs;
    return new Complex(k_k.real/k_abs2,k_k.imag/k_abs2);
  }
  //log_k(this)
  log_n(k){
    this.#Error_Argument_real(k);
    return new Complex(Math.log(this.abs)/Math.log(k),this.arg/Math.log(k));
  }
  //this^k
  pow_by(k){
    k = this.#RtoI(k);
    let k_k = k.pro(this.log);
    return k_k.exp;
  }
  //k^this
  pow_of(k){
    k = this.#RtoI(k);
    let k_k = this.pro(k.log);
    return k_k.exp;
  }
  //角度k[rad]回転させる。
  rotate(k){
    this.#Error_Argument_real(k);
    k = new Complex(0,1).pro(k).exp;
    return this.pro(k);
  }
};
