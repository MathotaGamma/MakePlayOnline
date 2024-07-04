let first = true;
let sleep_time_list = [0];
let paragraph_list = [];
let read_v = document.getElementById('read_v').value;
let english_list = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,!?;:()[]{}/\\|_+-=*^%$#@<>~'｀√′〝‘\'\"´’ ";

document.getElementById('read_v').addEventListener('input', ()=>{
  document.getElementById('value_v').innerText = '倍速:'+String(document.getElementById('read_v').value/100);
});

//sleep関数
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//読み上げ開始関数(Promiseが使える)
function speak(uttr) {
    return new Promise((resolve, reject) => {
        uttr.onend = () => {
            // 読み上げが終了した時にresolveを呼び出す
            resolve();
        };

        uttr.onerror = (error) => {
            // エラーが発生した時にrejectを呼び出す
            reject(error);
        };

        // 読み上げを開始
        window.speechSynthesis.speak(uttr);
    });
}

if ('speechSynthesis' in window) {
  async function play(){
    sleep_time_list = ["0"];
    paragraph_list = [];
    //alert('Hey');
    let paragraph = document.getElementById('text').value;

    read_v = document.getElementById('read_v').value/100;
    console.log(paragraph);
    //paragraph = paragraph.replace(/ /g,"[0]");
    paragraph = paragraph.replace(/\n/g,'[300]');

    while (paragraph.includes('[') && paragraph.includes(']')) {
      // [ の位置を取得
      let startIndex = paragraph.indexOf('[');

      // ] の位置を取得
      let endIndex = paragraph.indexOf(']');

      // [] の中身を取り出して配列に追加

      let sleep_time_k = paragraph.substring(startIndex+1,endIndex)
      if(paragraph.substring(0,startIndex) == ""){
        if(sleep_time_list.length>=1){
          sleep_time_list[sleep_time_list.length-1] = String(Number(sleep_time_k)+Number(sleep_time_list[sleep_time_list.length-1]));
          paragraph = paragraph.substring(endIndex + 1);
          continue;
        }
      }
      sleep_time_list.push(sleep_time_k);

      // 処理した[]を文字列から削除
      paragraph_list.push(paragraph.substring(0,startIndex));
      paragraph = paragraph.substring(endIndex + 1);
    }
    paragraph_list.push(paragraph);
    console.log(sleep_time_list);
    console.log(paragraph_list);
    const uttr = new SpeechSynthesisUtterance();
    if (first){
      first = false;
      alert("音が鳴ります。");
    }

    // 音を鳴らしている
    for (let k = 0; k < paragraph_list.length; k++){
      await sleep(Number(sleep_time_list[k]));
      
      
      // テキストを設定 (必須)
      if(paragraph_list[k] != ''){
        uttr.text = paragraph_list[k];
        let lang = "en-US";
        for (let k0 of Array.from(paragraph_list[k])){

          if (Array.from(english_list).includes(k0) == false){

            lang = "ja-JP";

          }
        }
        // 言語を設定
        uttr.lang = lang;

        // 速度を設定
        uttr.rate = read_v;

        // 高さを設定
        uttr.pitch = 1;

        // 音量を設定
        uttr.volume = 1;

        //読み上げ開始
        await speak(uttr)
        .then(() => {
            console.log('読み上げが終了しました。');
            
        })
        .catch(error => {
            console.error('読み上げ中にエラーが発生しました:', error);
        });

      }
      
      
    }
  }
} else {
  console.log('else');
}
