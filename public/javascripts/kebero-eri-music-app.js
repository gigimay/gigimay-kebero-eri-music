import { $, $$ } from './modules/bling';
import typeAhead from './modules/typeAhead';

typeAhead( $('.search'));



//****audio play button pour faire que play mais pas pause****//

var status = false;
var playproperty = document.getElementsByClassName('playproperty');

if (playproperty.length){
  playproperty[0].addEventListener('click', function audioHandler(e) {
    e.preventDefault();

    var elm = e.target;
    var audio = document.getElementsByClassName('audiocontrols')[0];

    console.log('hello', audio);

    var source = document.getElementsByClassName('audiosource')[0];
    source.elm = elm.getAttribute('data-value');
    console.log('bye', source);

    if(status == false || audio.paused){
      audio.play();
      status = true;
    }else{
      audio.pause();
      status = false;
    }

  });

}
