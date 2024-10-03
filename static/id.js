let date = localStorage.getItem('created_date');

let main_date = {{created_date | tojson}};
alert(main_date);

function id_post(){
  var form = document.createElement('form');
  form.action = '/sign';
  form.method = 'POST';
    
  // body に追加
  document.body.append(form);
    
  // formdta イベントに関数を登録(submit する直前に発火)
  form.addEventListener('formdata', (e) => {
    var fd = e.formData;
      
    // データをセット
    fd.set('email', 'dummy@gmail.com');
    fd.set('password', '1234abcd');
  });

  // submit
  form.submit();
}
if(date == null){
  id_post();
}
