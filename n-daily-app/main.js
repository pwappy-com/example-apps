function 設定値(){}
const urlBase='https://ncode.syosetu.com';const fetchBase='https://script.google.com/macros/s/AKfycbwqwwbtT_VEFRCfwR4D_jL0tcnXlWTcZiNPx7Xn5M_YPlFfTV3IP2DMzuoSGNcujpgT0w/exec'
if(!localStorage.getItem('volume')){localStorage.setItem('volume',100)}
if(!localStorage.getItem('rate')){localStorage.setItem('rate',1)}
if(!localStorage.getItem('pageAheadCount')){localStorage.setItem('pageAheadCount',0)}
if(!localStorage.getItem('wakeLock')){localStorage.setItem('wakeLock',!1)}
async function 作品一覧表示(event){const readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};const aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};const now=new Date();const nowJST=new Date(now.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'}));const thirtyDaysAgoJST=new Date(nowJST.getTime()-(30*24*60*60*1000));for(const url in readingHistory){const historyLastUpdate=new Date(readingHistory[url].lastUpdated);if(historyLastUpdate<new Date(thirtyDaysAgoJST)){delete readingHistory[url]}else{readingHistory[url].lastUpdated=nowJST.toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})}}
localStorage.setItem('readingHistory',JSON.stringify(readingHistory));for(const url in aheadPages){if(!readingHistory[url]){delete aheadPages[url]}}
localStorage.setItem('aheadPages',JSON.stringify(aheadPages));const onsModal1=document.getElementById('ons-modal1');onsModal1.show();try{const narouList=document.getElementById('narou-list');narouList.innerHTML='';const onsSegment1=document.getElementById('ons-segment1');let pageLocation=0;if(event.activeIndex!==undefined){pageLocation=event.activeIndex}else{pageLocation=onsSegment1.activeIndex}
await fetch(fetchBase+'?action=list&page='+(pageLocation+1)).then(response=>response.text()).then(data=>{const parsedData=Papa.parse(data,{header:!0,skipEmptyLines:!0}).data;parsedData.forEach((item,index)=>{const narouItemTemplate=document.getElementById('narou-item-template').cloneNode(!0);let narouItem=narouItemTemplate.content;narouItem.querySelector('.narou-item-title').textContent=item.タイトル;narouItem.querySelector('.narou-item-info').textContent=item.作品情報;narouItem.querySelector('.narou-item').setAttribute('title',item.タイトル);narouItem.querySelector('.narou-item').setAttribute('info',item.作品情報);narouItem.querySelector('.narou-item').setAttribute('status',item.連載状態);narouItem.querySelector('.narou-item').setAttribute('episode-count',item.話数);narouItem.querySelector('.narou-item').setAttribute('url',item.URL);narouItem.querySelector('.narou-item').setAttribute('ncode',item.ncode);narouItem.querySelector('.narou-item-number').textContent=pageLocation*50+index+1;narouItem.querySelector('.narou-item').addEventListener('click',(e)=>{なろう詳細ページへ飛ぶ(e)});let mouseDownTimer=null;let mouseX=null;let mouseY=null;let isMouseDown=!1;function resetMouseDownInfo(){if(mouseDownTimer){clearTimeout(mouseDownTimer)}
mouseDownTimer=null;mouseX=null;mouseY=null;isMouseDown=!1}
function isWithinPx(x,y){const ret=Math.abs(mouseX-x)<=30&&Math.abs(mouseY-y)<=30;return ret}
narouItem.querySelector('.narou-item').addEventListener('mousedown',(e)=>{mouseX=e.clientX;mouseY=e.clientY;isMouseDown=!0;mouseDownTimer=setTimeout(()=>{作品長押し(e);resetMouseDownInfo()},500)});narouItem.querySelector('.narou-item').addEventListener('mousemove',(e)=>{if(!isWithinPx(e.clientX,e.clientY)){resetMouseDownInfo()}});narouItem.querySelector('.narou-item').addEventListener('mouseup',(e)=>{resetMouseDownInfo()});narouItem.querySelector('.narou-item').addEventListener('touchstart',(e)=>{mouseX=e.touches[0].clientX;mouseY=e.touches[0].clientY;mouseDownTimer=setTimeout(()=>{作品長押し(e);if(navigator.vibrate){navigator.vibrate(50)}
resetMouseDownInfo()},500)});narouItem.querySelector('.narou-item').addEventListener('touchmove',(e)=>{if(!isWithinPx(e.touches[0].clientX,e.touches[0].clientY)){resetMouseDownInfo()}});narouItem.querySelector('.narou-item').addEventListener('touchend',(e)=>{resetMouseDownInfo()});if(index%2===0){narouItem.querySelector('.narou-item').classList.add('narou-item-even')}else{narouItem.querySelector('.narou-item').classList.add('narou-item-odd')}
narouList.appendChild(narouItem)})});アイコンの更新()}finally{onsModal1.hide()}}
function なろう詳細ページへ飛ぶ(e){const narouItem=e.target.closest('.narou-item');const ncode=narouItem.getAttribute('ncode');const url=narouItem.getAttribute('url');const title=narouItem.getAttribute('title');const status=narouItem.getAttribute('status');const episodeCount=narouItem.getAttribute('episode-count');try{history.pushState({},'','')}catch(e){}
const onsNavigator1=document.getElementById('ons-navigator1');onsNavigator1.pushPage('reader.html',{data:{ncode:ncode,url:url,title:title,status:status,episodeCount:episodeCount===""?1:Number(episodeCount),}})}
async function なろう詳細ページのShow(event){setLoadingIndicator(!0);const ncode=event.target.data.ncode;const title=event.target.data.title;const status=event.target.data.status;const episodeCount=event.target.data.episodeCount===""?1:Number(event.target.data.episodeCount);const url=event.target.data.url;const readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};const history=readingHistory[url];let currentPage=1;let currentRow=1;let totalRowCount=0;let totalEpisodeCount=episodeCount;if(history){currentPage=history.currentEpisode;currentRow=history.currentRow;totalRowCount=history.totalRowCount;totalEpisodeCount=episodeCount;history.totalEpisodeCount=episodeCount;if(currentPage===0)history.currentEpisode=1;localStorage.setItem('readingHistory',JSON.stringify(readingHistory))}
try{setupPageInfo(title,status,episodeCount,url);const selectElement=document.getElementById('ons-select1');if(currentPage!==0){selectElement.selectedIndex=currentPage-1}
const aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};if(aheadPages[url]&&aheadPages[url][currentPage]){const compressData=aheadPages[url][currentPage];const data=LZString.decompress(compressData);displayData(JSON.parse(data))}else{await fetchDataAndDisplayByPage(ncode,status,currentPage)}
if(currentRow>0&&currentRow<totalRowCount){const detailList=document.getElementById('detail-list');const listItems=detailList.querySelectorAll('.list-item_p');listItems[currentRow-1].classList.add('voice-speeching');listItems[currentRow-1].scrollIntoView({behavior:'smooth',block:'center'})}}finally{setLoadingIndicator(!1);pageButtonControl(currentPage,totalEpisodeCount)}}
function なろう詳細共通(){}
function setupPageInfo(title,status,episodeCount,url){const onsListHeaderLink=document.getElementById('ons-list-header-link');onsListHeaderLink.textContent=title;onsListHeaderLink.href=url;const onsSelect1=document.getElementById('ons-select1');if(status==='短編'){onsSelect1.style.display='none'}else{const select1=onsSelect1.querySelector('.select-input');select1.innerHTML='';for(let i=1;i<=episodeCount;i++){const option=document.createElement('option');option.value=i;option.text=`ページ - ${i}`;select1.appendChild(option)}}}
function pageButtonControl(currentPage,episodeCount){const prevPageButton=document.getElementById('prev-page-button');if(currentPage===1){prevPageButton.disabled=!0}else{prevPageButton.disabled=!1}
const nextPageButton=document.getElementById('next-page-button');if(currentPage===episodeCount){nextPageButton.disabled=!0}else{nextPageButton.disabled=!1}}
function fetchData(ncode,status,page){const type=status==='短編'?'short':'long';const nPath=status==='短編'?ncode:`${ncode}/${page}`;return fetch(`${fetchBase}?action=detail&type=${type}&nPath=${nPath}`).then(response=>response.text())}
function displayData(data){const narouReadListItem=document.getElementById('detail-list');narouReadListItem.innerHTML='';const lines=data.split('\n');lines.forEach(line=>{if(line.trim()!==''){const narouReadItemTemplate=document.getElementById('narou-read-item-template').cloneNode(!0);const narouReadItem=narouReadItemTemplate.content;narouReadItem.querySelector('ons-list-item').addEventListener('click',読み上げ行に設定);narouReadItem.querySelector('.list-item_p').textContent=line;narouReadListItem.appendChild(narouReadItem)}})}
async function fetchDataAndDisplayByPage(ncode,status,page){const narouReadListItem=document.getElementById('detail-list');narouReadListItem.innerHTML='';const data=await fetchData(ncode,status,page);displayData(data)}
function setLoadingIndicator(isLoading){const onsModal2=document.getElementById('ons-modal2');onsModal2.visible=isLoading;const prevPageButton=document.getElementById('prev-page-button');prevPageButton.disabled=isLoading;const onsSelect1=document.getElementById('ons-select1');onsSelect1.disabled=isLoading;const playButton=document.getElementById('play-button');playButton.disabled=isLoading;const nextPageButton=document.getElementById('next-page-button');nextPageButton.disabled=isLoading}
async function ページ選択(event){const page=event.target.closest('ons-page');const ncode=page.data.ncode;const status=page.data.status;const title=page.data.title;const episodeCount=page.data.episodeCount;const selectedPage=Number(event.target.value);if(!selectedPage)return;document.getElementById('ons-list-header2').scrollIntoView();setLoadingIndicator(!0);try{let url=`${urlBase}/${ncode}/`;const aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};if(aheadPages[url]&&aheadPages[url][selectedPage]){const compressData=aheadPages[url][selectedPage];const data=LZString.decompress(compressData);displayData(JSON.parse(data))}else{await fetchDataAndDisplayByPage(ncode,status,selectedPage)}
pageButtonControl(selectedPage,episodeCount)
if(window.reading===!0){読み上げ開始()}
ページ先読み(ncode)}finally{setLoadingIndicator(!1);pageButtonControl(selectedPage,episodeCount)}}
function 前のページへ移動(event){const selectElement=document.querySelector('#select1');const selectedIndex=selectElement.selectedIndex;if(selectedIndex>0){selectElement.selectedIndex=selectedIndex-1;const event=new Event('change',{bubbles:!0,cancelable:!0});selectElement.dispatchEvent(event)}}
function 次のページに移動(event){const selectElement=document.querySelector('#select1');const selectedIndex=selectElement.selectedIndex;if(selectedIndex<selectElement.options.length-1){selectElement.selectedIndex=selectedIndex+1;const event=new Event('change',{bubbles:!0,cancelable:!0});selectElement.dispatchEvent(event)}}
function 読み上げページ初期化(event){setLoadingIndicator(!0)}
function 読み上げ開始(event){const detailList=document.getElementById('detail-list');const listItems=detailList.querySelectorAll('.list-item_p');const page=detailList.closest('ons-page');const ncode=detailList.closest('ons-page').data.ncode;const episodeCount=page.data.episodeCount===""?1:page.data.episodeCount;ページ先読み(ncode);let currentIndex=0;const voiceSpeechingItems=detailList.querySelectorAll('.voice-speeching');if(voiceSpeechingItems.length>0){currentIndex=Array.from(listItems).indexOf(voiceSpeechingItems[0])}
function readNextItem(){if(currentIndex<listItems.length){const listItem=listItems[currentIndex];const text=listItem.textContent;const textToRead=text.replace(/\|([^《]+)《([^》]+)》/g,' $2');const utterance=new SpeechSynthesisUtterance(textToRead);utterance.lang="ja-JP";utterance.rate=parseFloat(localStorage.getItem('rate'))||1;utterance.volume=parseFloat(localStorage.getItem('volume'))/100;utterance.voice=speechSynthesis.getVoices().filter(voice=>voice.name===localStorage.getItem('voice'))[0];speechSynthesis.speak(utterance);listItem.classList.add('voice-speeching');utterance.onend=()=>{listItem.scrollIntoView({behavior:'smooth',block:'center'});listItem.classList.remove('voice-speeching');currentIndex++;saveReadingHistory(page.data.url,currentIndex,listItems.length,episodeCount);readNextItem()}}else{if(document.getElementById('next-page-button').disabled===!1){document.getElementById('next-page-button').click()}else{読み上げ停止();ons.notification.confirm({title:'評価しますか？',message:'サイトに移動して★をつけましょう',buttonLabels:['いいえ','はい'],cancelable:!0,id:"hyouka-confirm",callback:function(answer){if(answer===1){const selectedPage=document.getElementById('ons-select1').value;const targetUrl=`${urlBase}/${ncode}/${selectedPage}#novel_hyouka`;window.open(targetUrl,'_blank')}}})}}}
document.getElementById('play-button').style.display='none';document.getElementById('pause-button').style.display='flex';window.reading=!0;if(navigator.wakeLock){navigator.wakeLock.request('screen').then(wakeLock=>{window.screenWakeLock=wakeLock}).catch(err=>{console.error('Wake Lock API error: ',err)})}
readNextItem()}
function saveReadingHistory(url,readCount,totalCount,episodeCount){let readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};const currentPage=document.getElementById('ons-select1').selectedIndex===-1?1:document.getElementById('ons-select1').selectedIndex+1;const timestamp=new Date().toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'});readingHistory[url]=readingHistory[url]||{};readingHistory[url]={totalEpisodeCount:episodeCount===""?0:Number(episodeCount),currentEpisode:currentPage,totalRowCount:totalCount,currentRow:readCount,status:readCount===totalCount?'Done':readCount===0?'Unread':'Reading',lastUpdated:timestamp,};localStorage.setItem('readingHistory',JSON.stringify(readingHistory))}
function 読み上げ停止(event){if(window.reading){speechSynthesis.cancel();document.getElementById('pause-button').style.display='none';document.getElementById('play-button').style.display='flex';window.reading=!1;if(window.screenWakeLock){window.screenWakeLock.release().then(()=>{window.screenWakeLock=null})}}}
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

    <ons-list-item id="ons-list-item13" style="display: flex;">
      <label id="label7" class="list-item__label">
        ページ先読み数
      </label>
      <div id="div51" class="right">
        <ons-input type="number" id="page-read-ahead" value="${localStorage.getItem('pageAheadCount') || 0}" min="0">
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
    `;dialog.cancelable=!0;document.body.appendChild(dialog);dialog.show();dialog.querySelector('#dialog-button').addEventListener('click',()=>{const volume=dialog.querySelector('#volume-range').value;const rate=dialog.querySelector('#rate-range').value;const voice=dialog.querySelector('#voice-select').value;const pageAheadCount=dialog.querySelector('#page-read-ahead').value;const wakeLock=dialog.querySelector('#wake-lock-checkbox').checked;localStorage.setItem('volume',volume);localStorage.setItem('rate',rate);localStorage.setItem('voice',voice);localStorage.setItem('pageAheadCount',pageAheadCount);localStorage.setItem('wakeLock',wakeLock);dialog.hide()});dialog.querySelector('#volume-range').addEventListener('input',(event)=>{dialog.querySelector('#span1').textContent=event.target.value});dialog.querySelector('#rate-range').addEventListener('input',(event)=>{dialog.querySelector('#span2').textContent=event.target.value})}
function getJapaneseVoices(){const speechSynthesis=window.speechSynthesis;const voices=speechSynthesis.getVoices();const japaneseVoices=voices.filter(voice=>{return voice.lang==='ja-JP'||voice.lang.startsWith('ja-')});return japaneseVoices}
function 読み上げ行に設定(event){const detailList=document.getElementById('detail-list');const listItems=detailList.querySelectorAll('.list-item_p');listItems.forEach(listItem=>{listItem.classList.remove('voice-speeching')});const parent=event.target.closest('ons-list-item');const target=parent.querySelector('.list-item_p');target.classList.add('voice-speeching');if(window.reading===!0){読み上げ停止()}else{読み上げ開始()}}
function ヒストリー消去(event){window.history.back()}
function バックボタン処理(event){const onsNavigator1=document.getElementById('ons-navigator1');onsNavigator1.popPage()}
function アイコンの更新(event){const narouList=document.getElementById('narou-list');const narouItems=narouList.querySelectorAll('.narou-item');narouItems.forEach(narouItem=>{const url=narouItem.getAttribute('url');const readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};const historyItem=readingHistory[url];let readingStatus='Unread';let totalEpisodeCount=1;let currentEpisode=1;if(historyItem){readingStatus=historyItem.status!==undefined?historyItem.status:'Unread';totalEpisodeCount=historyItem.totalEpisodeCount!==undefined?historyItem.totalEpisodeCount:1;currentEpisode=historyItem.currentEpisode!==undefined?historyItem.currentEpisode:1}
if(readingStatus=='Done'&&totalEpisodeCount!==currentEpisode){readingStatus='Reading'}
const icon=narouItem.querySelector('.narou-item-icon');if(readingStatus==='Reading'){icon.setAttribute('icon','fa-book-open');icon.style.color="#eb9d9d"}else if(readingStatus==='Done'){icon.setAttribute('icon','fa-check');icon.style.color="green"}else{icon.setAttribute('icon','fa-book');icon.style.color="rgb(175, 175, 175)"}})}
async function ページ先読み(ncode){const page=document.querySelector('#ons-page2');if(page.data.status==='短編')return;const url=`${urlBase}/${ncode}/`;const pageAheadCount=parseInt(localStorage.getItem('pageAheadCount'))||0;const readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};const currentPage=parseInt(document.getElementById('ons-select1').value)||1;const totalEpisodeCount=readingHistory[url]?readingHistory[url].totalEpisodeCount:1;let aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};for(let i=currentPage;i<=currentPage+pageAheadCount&&i<=totalEpisodeCount;i++){if(aheadPages[url]&&aheadPages[url][i]){continue}
try{const data=await fetchData(ncode,'',i);aheadPages[url]=aheadPages[url]||{};aheadPages[url][i]=LZString.compress(JSON.stringify(data));localStorage.setItem('aheadPages',JSON.stringify(aheadPages));await new Promise(resolve=>setTimeout(resolve,10000))}catch(e){console.log('エラー発生');break}}}
function 作品長押し(event){function 未読にする(element){const dialog=element.target.closest('ons-dialog');const readingHistory=JSON.parse(localStorage.getItem('readingHistory'))||{};delete readingHistory[url];localStorage.setItem('readingHistory',JSON.stringify(readingHistory));dialog.hide();アイコンの更新()}
function 先読みデータ消去(element){const dialog=element.target.closest('ons-dialog');const aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};delete aheadPages[url];localStorage.setItem('aheadPages',JSON.stringify(aheadPages));dialog.hide()}
const target=event.target.closest('ons-list-item');const url=target.getAttribute('url');const title=target.getAttribute('title');const dialog=document.createElement('ons-dialog');const aheadPages=JSON.parse(localStorage.getItem('aheadPages'))||{};const aheadPageData=aheadPages[url];const aheadPageCount=aheadPageData?Object.keys(aheadPageData).length:0;dialog.cancelable=!0;dialog.innerHTML=`
    <div style="
    text-align: center;
    padding: 10px;
    display: flex;
    flex-direction: column;
">
  <p>
    ${title}
  </p>
  <ons-button id="midoku" modifier="outline">
    未読にする
  </ons-button>
  <ons-button id="sakiDel" modifier="outline">
    先読みデータ消去(${aheadPageCount})
  </ons-button>
</div>
    `;document.body.appendChild(dialog);dialog.show();dialog.querySelector('#midoku').addEventListener('click',未読にする);dialog.querySelector('#sakiDel').addEventListener('click',先読みデータ消去)}
function 左にスワイプ(event){if(event.target.closest('#narou-list')){const onsSegment1=document.getElementById('ons-segment1');let index=onsSegment1.activeIndex;if(index<5){onsSegment1.setActiveButton(index+1)}}}
function 右にスワイプ(event){if(event.target.closest('#narou-list')){const onsSegment1=document.getElementById('ons-segment1');let index=onsSegment1.activeIndex;if(index>0){onsSegment1.setActiveButton(index-1)}}}
function 評価ダイアログを閉じる(event){debugger
const confirm=document.getElementById('hyouka-confirm');if(confirm){confirm.remove()}}
window.addEventListener('popstate',バックボタン処理);document.addEventListener('swipeleft',左にスワイプ);document.addEventListener('swiperight',右にスワイプ);document.addEventListener('init',(event)=>{let page=event.target;if(page.id==='ons-page2'){let onsselect1_element=document.querySelector('#ons-select1');if(onsselect1_element){onsselect1_element.addEventListener('change',ページ選択);page.addEventListener('destroy',function(event){onsselect1_element.removeEventListener('change',ページ選択)},{'once':!0})}
let prevpagebutton_element=document.querySelector('#prev-page-button');if(prevpagebutton_element){prevpagebutton_element.addEventListener('click',前のページへ移動);page.addEventListener('destroy',function(event){prevpagebutton_element.removeEventListener('click',前のページへ移動)},{'once':!0})}
let nextpagebutton_element=document.querySelector('#next-page-button');if(nextpagebutton_element){nextpagebutton_element.addEventListener('click',次のページに移動);page.addEventListener('destroy',function(event){nextpagebutton_element.removeEventListener('click',次のページに移動)},{'once':!0})}
let playbutton_element=document.querySelector('#play-button');if(playbutton_element){playbutton_element.addEventListener('click',読み上げ開始);page.addEventListener('destroy',function(event){playbutton_element.removeEventListener('click',読み上げ開始)},{'once':!0})}
let pausebutton_element=document.querySelector('#pause-button');if(pausebutton_element){pausebutton_element.addEventListener('click',読み上げ停止);page.addEventListener('destroy',function(event){pausebutton_element.removeEventListener('click',読み上げ停止)},{'once':!0})}
let onstoolbarbutton2_element=document.querySelector('#ons-toolbar-button2');if(onstoolbarbutton2_element){onstoolbarbutton2_element.addEventListener('click',読み上げ設定);page.addEventListener('destroy',function(event){onstoolbarbutton2_element.removeEventListener('click',読み上げ設定)},{'once':!0})}
読み上げページ初期化(event);page.addEventListener('show',なろう詳細ページのShow);page.addEventListener('destroy',function(event){page.removeEventListener('show',なろう詳細ページのShow)},{'once':!0});page.addEventListener('hide',読み上げ停止);page.addEventListener('destroy',function(event){page.removeEventListener('hide',読み上げ停止)},{'once':!0});page.addEventListener('hide',ヒストリー消去);page.addEventListener('destroy',function(event){page.removeEventListener('hide',ヒストリー消去)},{'once':!0});page.addEventListener('hide',評価ダイアログを閉じる);page.addEventListener('destroy',function(event){page.removeEventListener('hide',評価ダイアログを閉じる)},{'once':!0})}});document.addEventListener('init',(event)=>{let page=event.target;if(page.id==='ons-page1'){作品一覧表示(event);page.addEventListener('show',アイコンの更新);page.addEventListener('destroy',function(event){page.removeEventListener('show',アイコンの更新)},{'once':!0});let onssegment1_element=document.querySelector('#ons-segment1');if(onssegment1_element){onssegment1_element.addEventListener('postchange',作品一覧表示);page.addEventListener('destroy',function(event){onssegment1_element.removeEventListener('postchange',作品一覧表示)},{'once':!0})}}})