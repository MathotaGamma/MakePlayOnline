
class Complex {
  constructor(k_real, k_imag) {
    this._real = k_real;
    this._imag = k_imag;
  }
  get real(){
    return this._real;
  }
  get imag(){
    return this._imag;
  }
  get value(){
    return [this._real, this._imag];
  }
  get conj(){
    return new Complex(this._real, -this._imag);
  }
  get abs(){
    return Math.sqrt(this._real * this._real + this._imag * this._imag);
  }
  set(k){
    this._real = k.real;
    this._imag = k.imag;
  }
  add(k){
    return new Complex(this._real + k.real, this._imag + k.imag);
  }
  dif(k){
    return new Complex(this._real - k.real, this._imag - k.imag);
  }
  pro(k){
    return new Complex(
      this._real * k.real - this._imag * k.imag,
      this._real * k.imag + this._imag * k.real
    );
  }
  div(k){
    let k_k = this.pro(k.conj);
    let k_abs2 = k.abs * k.abs;
    return new Complex(k_k.real / k_abs2, k_k.imag / k_abs2);
  }
};
