let date = localStorage.getItem('created_date');

let name = localStorage.getItem('name');
let pass = localStorage.getItem('pass');
let id = localStorage.getItem('id');

let main_date = {{created_date | tojson}};
alert(main_date);

function id_post(){
  
  var form = document.createElement('form');
  form.action = '/Connect/sign';
  form.method = 'POST';
    
  // body に追加
  document.body.append(form);
    
  // formdta イベントに関数を登録(submit する直前に発火)
  form.addEventListener('formdata', (e) => {
    var fd = e.formData;
      
    // データをセット
    fd.set('name', name);
    fd.set('pass', pass);
  });

  // submit
  form.submit();
}

if(name == null || pass == null){
  location.href = "/Connect/homepage";
} else if(date == null || id == null){
  id_post();
}
