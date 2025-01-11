function 設定値(){}
const fetchBase='https://script.google.com/macros/s/AKfycbz2mr_s0X-NigV6bePETVFm0M1zWKVersHfTRJfGjNZx1PGtpGqu0h5EIU_UJy2P5_2/exec'
async function 作品一覧表示(event){const onsModal1=document.getElementById('ons-modal1');onsModal1.show();try{const narouList=document.getElementById('narou-list');narouList.innerHTML='';const onsSegment1=document.getElementById('ons-segment1');let pageLocation=0;if(event.activeIndex!==undefined){pageLocation=event.activeIndex}else{pageLocation=onsSegment1.activeIndex}
await fetch(fetchBase+'?action=list&page='+(pageLocation+1)).then(response=>response.text()).then(data=>{const parsedData=Papa.parse(data,{header:!0,skipEmptyLines:!0}).data;parsedData.forEach((item,index)=>{const narouItemTemplate=document.getElementById('narou-item-template').cloneNode(!0);let narouItem=narouItemTemplate.content;narouItem.querySelector('.narou-item-title').textContent=item.タイトル;narouItem.querySelector('.narou-item-info').textContent=item.作品情報;narouItem.querySelector('.narou-item').setAttribute('title',item.タイトル);narouItem.querySelector('.narou-item').setAttribute('info',item.作品情報);narouItem.querySelector('.narou-item').setAttribute('status',item.連載状態);narouItem.querySelector('.narou-item').setAttribute('episode-count',item.話数);narouItem.querySelector('.narou-item').setAttribute('url',item.URL);narouItem.querySelector('.narou-item').setAttribute('ncode',item.ncode);narouItem.querySelector('.narou-item-number').textContent=pageLocation*50+index+1;narouItem.querySelector('.narou-item').addEventListener('click',(e)=>{なろう詳細ページへ飛ぶ(e)});if(index%2===0){narouItem.querySelector('.narou-item').classList.add('narou-item-even')}else{narouItem.querySelector('.narou-item').classList.add('narou-item-odd')}
narouList.appendChild(narouItem)})})}finally{onsModal1.hide()}}
function なろう詳細ページへ飛ぶ(e){const narouItem=e.target.closest('.narou-item');const ncode=narouItem.getAttribute('ncode');const url=narouItem.getAttribute('url');const title=narouItem.getAttribute('title');const status=narouItem.getAttribute('status');const episodeCount=narouItem.getAttribute('episode-count');try{history.pushState({},'','')}catch(e){}
const onsNavigator1=document.getElementById('ons-navigator1');onsNavigator1.pushPage('reader.html',{data:{ncode:ncode,url:url,title:title,status:status,episodeCount:episodeCount,}})}
async function なろう詳細ページのShow(event){setLoadingIndicator(!0);try{const ncode=event.target.data.ncode;const title=event.target.data.title;const status=event.target.data.status;const episodeCount=event.target.data.episodeCount;const url=event.target.data.url;setupPageInfo(title,status,episodeCount,url);await fetchDataAndDisplayByPage(ncode,status,1)}finally{setLoadingIndicator(!1);pageButtonControl(1,episodeCount)}}
function なろう詳細共通(){}
function setupPageInfo(title,status,episodeCount,url){const onsListHeaderLink=document.getElementById('ons-list-header-link');onsListHeaderLink.textContent=title;onsListHeaderLink.href=url;const onsSelect1=document.getElementById('ons-select1');if(status==='短編'){onsSelect1.style.display='none'}else{const select1=onsSelect1.querySelector('.select-input');select1.innerHTML='';for(let i=1;i<=episodeCount;i++){const option=document.createElement('option');option.value=i;option.text=`ページ - ${i}`;select1.appendChild(option)}}}
function pageButtonControl(currentPage,episodeCount){const prevPageButton=document.getElementById('prev-page-button');if(currentPage===1){prevPageButton.disabled=!0}else{prevPageButton.disabled=!1}
const nextPageButton=document.getElementById('next-page-button');if(currentPage===episodeCount){nextPageButton.disabled=!0}else{nextPageButton.disabled=!1}}
async function fetchDataAndDisplayByPage(ncode,status,page){const narouReadListItem=document.getElementById('detail-list');narouReadListItem.innerHTML='';const type=status==='短編'?'short':'long';const nPath=status==='短編'?ncode:`${ncode}/${page}`;await fetch(`${fetchBase}?action=detail&type=${type}&nPath=${nPath}`).then(response=>response.text()).then(data=>{const lines=data.split('\n');lines.forEach(line=>{if(line.trim()!==''){const narouReadItemTemplate=document.getElementById('narou-read-item-template').cloneNode(!0);const narouReadItem=narouReadItemTemplate.content;narouReadItem.querySelector('ons-list-item').addEventListener('click',読み上げ行に設定);narouReadItem.querySelector('.list-item_p').textContent=line;narouReadListItem.appendChild(narouReadItem)}})})}
function setLoadingIndicator(isLoading){const onsProgressCircular2=document.getElementById('ons-progress-circular2');onsProgressCircular2.indeterminate=isLoading;const prevPageButton=document.getElementById('prev-page-button');prevPageButton.disabled=isLoading;const onsSelect1=document.getElementById('ons-select1');onsSelect1.disabled=isLoading;const playButton=document.getElementById('play-button');playButton.disabled=isLoading;const nextPageButton=document.getElementById('next-page-button');nextPageButton.disabled=isLoading}
async function ページ選択(event){const page=event.target.closest('ons-page');const ncode=page.data.ncode;const status=page.data.status;const title=page.data.title;const episodeCount=page.data.episodeCount;const selectedPage=event.target.value;if(!selectedPage)return;setLoadingIndicator(!0);try{await fetchDataAndDisplayByPage(ncode,status,selectedPage);if(window.reading===!0){読み上げ開始()}}finally{setLoadingIndicator(!1);pageButtonControl(selectedPage,episodeCount)}}
function 前のページへ移動(event){const selectElement=document.querySelector('#select1');const selectedIndex=selectElement.selectedIndex;if(selectedIndex>0){selectElement.selectedIndex=selectedIndex-1;const event=new Event('change',{bubbles:!0,cancelable:!0});selectElement.dispatchEvent(event)}}
function 次のページに移動(event){const selectElement=document.querySelector('#select1');const selectedIndex=selectElement.selectedIndex;if(selectedIndex<selectElement.options.length-1){selectElement.selectedIndex=selectedIndex+1;const event=new Event('change',{bubbles:!0,cancelable:!0});selectElement.dispatchEvent(event)}}
function 読み上げ開始(event){const detailList=document.getElementById('detail-list');const listItems=detailList.querySelectorAll('.list-item_p');let currentIndex=0;const voiceSpeechingItems=detailList.querySelectorAll('.voice-speeching');if(voiceSpeechingItems.length>0){currentIndex=Array.from(listItems).indexOf(voiceSpeechingItems[0])}
function readNextItem(){if(currentIndex<listItems.length){const listItem=listItems[currentIndex];const text=listItem.textContent;const textToRead=text.replace(/\|([^《]+)《([^》]+)》/g,' $2');const utterance=new SpeechSynthesisUtterance(textToRead);utterance.lang="ja-JP";utterance.rate=parseFloat(localStorage.getItem('rate'))||1;utterance.volume=parseFloat(localStorage.getItem('volume'))/100;utterance.voice=speechSynthesis.getVoices().filter(voice=>voice.name===localStorage.getItem('voice'))[0];speechSynthesis.speak(utterance);listItem.classList.add('voice-speeching');utterance.onend=()=>{listItem.scrollIntoView({behavior:'smooth',block:'center'});listItem.classList.remove('voice-speeching');currentIndex++;readNextItem()}}else{const selectItems=document.getElementById('ons-select1').querySelectorAll('ons-select-option');if(selectItems[selectItems.length-1]!==document.getElementById('ons-select1').querySelector('ons-select-option.selected')){document.getElementById('next-page-button').click()}else{document.getElementById('pause-button').style.display='none';document.getElementById('play-button').style.display='flex';window.reading=!1;if(window.screenWakeLock){window.screenWakeLock.unlock()}}}}
document.getElementById('play-button').style.display='none';document.getElementById('pause-button').style.display='flex';window.reading=!0;if(navigator.wakeLock){navigator.wakeLock.request('screen').then(wakeLock=>{window.screenWakeLock=wakeLock}).catch(err=>{console.error('Wake Lock API error: ',err)})}
readNextItem()}
function 読み上げ停止(event){if(window.reading){speechSynthesis.cancel();document.getElementById('pause-button').style.display='none';document.getElementById('play-button').style.display='flex';window.reading=!1;if(window.screenWakeLock){window.screenWakeLock.unlock()}}}
function 読み上げ設定(event){const dialog=document.createElement('ons-dialog');dialog.innerHTML=`
<div id="div44" style="padding: 20px;">
  <div id="div45" style="justify-content: center; display:flex;">
    読み上げ設定
  </div>
  <ons-list id="ons-list2">
    <ons-list-item id="ons-list-item9" style="
    display: flex;
">
      <label id="label3" class="list-item__label">
        音量
      </label>
      <div id="div46" class="right">
        <span id="span1">
          ${localStorage.getItem('volume') || 50}
        </span>
      </div>
      <ons-range id="volume-range" value="${localStorage.getItem('volume') || 50}" min="0" max="100" step="10" style="
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    order: 1;
    align-self: auto;
  ">
      </ons-range>
    </ons-list-item>
    <ons-list-item id="ons-list-item10" style="
    display: flex;
">
      <label id="label4" class="list-item__label">
        速度
      </label>
      <div id="div47" class="right">
        <span id="span2">
          ${localStorage.getItem('rate') || 1}
        </span>
      </div>
      <ons-range id="rate-range" value="${localStorage.getItem('rate') || 1}" min="0.25" max="5.0" step="0.25" style="
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    order: 1;
    align-self: auto;
  ">
      </ons-range>
    </ons-list-item>
    <ons-list-item id="ons-list-item11" style="
    display: flex;
">
      <label id="label5" class="list-item__label">
        声
      </label>
      <div id="div48" class="right">
        <select id="voice-select">
          ${getJapaneseVoices().map(voice => `<option value="${voice.name}">${voice.name}</option>`).join('')}
        </select>
      </div>
    </ons-list-item>
    <ons-list-item id="ons-list-item12" style="
    display: flex;
">
      <label id="label6" class="list-item__label">
        画面ロック防止
      </label>
      <div id="div49" class="right">
        <ons-checkbox id="wake-lock-checkbox" ${localStorage.getItem('wakeLock') === 'true' ? 'checked="checked"' : ''}>
        </ons-checkbox>
      </div>
    </ons-list-item>
  </ons-list>
  <div id="div50" style="display: flex; justify-content: center;">
    <ons-button id="dialog-button">
      OK
    </ons-button>
  </div>
</div>
    `;dialog.cancelable=!0;debugger
document.body.appendChild(dialog);dialog.show();dialog.querySelector('#dialog-button').addEventListener('click',()=>{const volume=dialog.querySelector('#volume-range').value;const rate=dialog.querySelector('#rate-range').value;const voice=dialog.querySelector('#voice-select').value;const wakeLock=dialog.querySelector('#wake-lock-checkbox').checked;localStorage.setItem('volume',volume);localStorage.setItem('rate',rate);localStorage.setItem('voice',voice);localStorage.setItem('wakeLock',wakeLock);dialog.hide()});dialog.querySelector('#volume-range').addEventListener('input',(event)=>{dialog.querySelector('#span1').textContent=event.target.value});dialog.querySelector('#rate-range').addEventListener('input',(event)=>{dialog.querySelector('#span2').textContent=event.target.value})}
function getJapaneseVoices(){const speechSynthesis=window.speechSynthesis;const voices=speechSynthesis.getVoices();const japaneseVoices=voices.filter(voice=>{return voice.lang==='ja-JP'||voice.lang.startsWith('ja-')});return japaneseVoices}
function 読み上げ行に設定(event){const detailList=document.getElementById('detail-list');const listItems=detailList.querySelectorAll('.list-item_p');listItems.forEach(listItem=>{listItem.classList.remove('voice-speeching')});const parent=event.target.closest('ons-list-item');const target=parent.querySelector('.list-item_p');target.classList.add('voice-speeching');読み上げ停止();読み上げ開始()}
function ヒストリー消去(event){window.history.back()}
function バックボタン処理(event){const onsNavigator1=document.getElementById('ons-navigator1');onsNavigator1.popPage()}
window.addEventListener('popstate',バックボタン処理);document.addEventListener('init',(event)=>{let page=event.target;if(page.id==='ons-page2'){let onsselect1_element=document.querySelector('#ons-select1');if(onsselect1_element){onsselect1_element.addEventListener('change',ページ選択);page.addEventListener('destroy',function(event){onsselect1_element.removeEventListener('change',ページ選択)},{'once':!0})}
let prevpagebutton_element=document.querySelector('#prev-page-button');if(prevpagebutton_element){prevpagebutton_element.addEventListener('click',前のページへ移動);page.addEventListener('destroy',function(event){prevpagebutton_element.removeEventListener('click',前のページへ移動)},{'once':!0})}
let nextpagebutton_element=document.querySelector('#next-page-button');if(nextpagebutton_element){nextpagebutton_element.addEventListener('click',次のページに移動);page.addEventListener('destroy',function(event){nextpagebutton_element.removeEventListener('click',次のページに移動)},{'once':!0})}
let playbutton_element=document.querySelector('#play-button');if(playbutton_element){playbutton_element.addEventListener('click',読み上げ開始);page.addEventListener('destroy',function(event){playbutton_element.removeEventListener('click',読み上げ開始)},{'once':!0})}
let pausebutton_element=document.querySelector('#pause-button');if(pausebutton_element){pausebutton_element.addEventListener('click',読み上げ停止);page.addEventListener('destroy',function(event){pausebutton_element.removeEventListener('click',読み上げ停止)},{'once':!0})}
let onstoolbarbutton2_element=document.querySelector('#ons-toolbar-button2');if(onstoolbarbutton2_element){onstoolbarbutton2_element.addEventListener('click',読み上げ設定);page.addEventListener('destroy',function(event){onstoolbarbutton2_element.removeEventListener('click',読み上げ設定)},{'once':!0})}
page.addEventListener('show',なろう詳細ページのShow);page.addEventListener('destroy',function(event){page.removeEventListener('show',なろう詳細ページのShow)},{'once':!0});page.addEventListener('hide',読み上げ停止);page.addEventListener('destroy',function(event){page.removeEventListener('hide',読み上げ停止)},{'once':!0});page.addEventListener('hide',ヒストリー消去);page.addEventListener('destroy',function(event){page.removeEventListener('hide',ヒストリー消去)},{'once':!0})}});document.addEventListener('init',(event)=>{let page=event.target;if(page.id==='ons-page1'){let onstoolbarbutton1_element=document.querySelector('#ons-toolbar-button1');if(onstoolbarbutton1_element){onstoolbarbutton1_element.addEventListener('click',作品一覧表示);page.addEventListener('destroy',function(event){onstoolbarbutton1_element.removeEventListener('click',作品一覧表示)},{'once':!0})}
作品一覧表示(event);let onssegment1_element=document.querySelector('#ons-segment1');if(onssegment1_element){onssegment1_element.addEventListener('postchange',作品一覧表示);page.addEventListener('destroy',function(event){onssegment1_element.removeEventListener('postchange',作品一覧表示)},{'once':!0})}}})