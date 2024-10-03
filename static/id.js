let date = localStorage.getItem('created_date');

let main_date = {{created_date | tojson}};
alert(main_date);

function id_post(){
  alert('null');
}
if(date == null){
  id_post();
}
