function 定数() {
    
}

const serverBase = "https://script.google.com/macros/s/AKfycbza3MEzjv_fRfeFcgbLWtLC4XbT0zXK1C9Pwa3zDL3oZBIOzXgGCesrF-qMledjIm0wJw/exec";

//8B
//const serverBase = "https://script.google.com/macros/s/AKfycbyAXBQQFrDREpLDNti_7SZ024Jl4Vby-vWQKpeBkZfkm9dTjEDRYHTGDhJqSPD-O_MKwQ/exec";



function 地域マスタ取得(event) {

    // serverBaseに
    // action=getRegionsをオプションとして与えて
    // fetchをする
    // 以下はサーバーサイドのコードで返答はjson
    // ons-select-regionsに返答をセットする
    //     /**
    //  * 地域マスタを取得するアクションの処理
    //  * @returns {GoogleAppsScript.Content.TextOutput} 地域マスタのJSON
    //  */
    // function handleGetRegionsAction() {
    //   const cache = CacheService.getScriptCache();
    //   let cachedRegions = cache.get(REGIONS_CACHE_KEY);

    //   if (cachedRegions) {
    //     Logger.log(&quot;キャッシュから地域マスタを取得しました。&quot;);
    //     return ContentService.createTextOutput(cachedRegions).setMimeType(ContentService.MimeType.JSON);
    //   }

    //   try {
    //     const ss = SpreadsheetApp.getActiveSpreadsheet();
    //     const sheet = ss.getSheetByName(&quot;地域マスタ&quot;);
    //     if (!sheet) {
    //       Logger.log(&quot;シート \'地域マスタ\' が見つかりません。&quot;);
    //       return ContentService.createTextOutput(&quot;シート \'地域マスタ\' が見つかりません。&quot;).setMimeType(ContentService.MimeType.TEXT);
    //     }

    //     const data = sheet.getDataRange().getValues();
    //     // 1行目はヘッダーなのでスキップ
    //     const regions = data.slice(1).map(row =&gt; ({
    //       name: row[0],
    //       code: row[1],
    //     }));

    //     const output = {
    //       regions: regions,
    //     }
    //     const jsonOutput = JSON.stringify(output);
    //     cache.put(REGIONS_CACHE_KEY, jsonOutput, REGIONS_CACHE_EXPIRATION_SECONDS);
    //     Logger.log(&quot;スプレッドシートから地域マスタを取得し、キャッシュに保存しました。&quot;);
    //     return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);

    //   } catch (error) {
    //     Logger.log(`handleGetRegionsAction関数でエラーが発生しました: ${error}`);
    //     return ContentService.createTextOutput(`サーバーエラーが発生しました。詳細: ${error}`).setMimeType(ContentService.MimeType.TEXT);
    //   }
    // }

    // 地域マスタはめったに変わることはないので、
    // 一度取得したらlocalStorageに保存しておく
    // localStorageはこのアプリ専用のkey(nanimiru-app)のなかに、
    // {nanimiru-app: {regions:[{code:text},...]}}の形で保持する
    //const nanimiruAppStore = JSON.parse(localStorage.getItem('nanimiru-app')) | {};
    //const regions = nanimiruAppStore.regions | {};
    const nanimiruAppStore = JSON.parse(localStorage.getItem('nanimiru-app')) || {};
    const regions = nanimiruAppStore.regions || [];
    const settings = nanimiruAppStore.settings || {};
    if (regions.length > 0) {
        const selectRegions = document.querySelector('#select-regions');
        selectRegions.innerHTML = '';
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region.code;
            option.text = region.name;
            selectRegions.appendChild(option);
        });

        // settings.myRegionがあれば設定する
        if (settings.myRegion) {
            selectRegions.value = settings.myRegion;
        }
        return;
    } else {
        nanimiruAppStore.regions = regions;
        nanimiruAppStore.settings = settings;
    }

    fetch(serverBase + '?action=getRegions')
        .then(response => response.json())
        .then(data => {
            const selectRegions = document.querySelector('#select-regions');
            selectRegions.innerHTML = '';
            data.regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.code;
                option.text = region.name;
                selectRegions.appendChild(option);
            });

            const myRegion = Number(selectRegions.value);
            nanimiruAppStore.regions = data.regions;
            nanimiruAppStore.settings.myRegion = myRegion;
            localStorage.setItem('nanimiru-app', JSON.stringify(nanimiruAppStore));
        })
        .catch(error => {
            console.error('地域マスタ取得に失敗しました:', error);
        });
}

function 地域選択(event) {
    // 地域を選択したときにlocalStorageのnanimiru-appのsettingsのmyRegionにコードを設定する
    const nanimiruAppStore = JSON.parse(localStorage.getItem('nanimiru-app')) || {};
    const settings = nanimiruAppStore.settings || {};
    settings.myRegion = Number(event.target.value);
    nanimiruAppStore.settings = settings;
    localStorage.setItem('nanimiru-app', JSON.stringify(nanimiruAppStore));
}

let userToken = null;
let next_question_time = null;
let expiration_time = null;
let server_time = null;

async function 初期アクション実行(event) {
    // let userToken = null;
    // let next_question_time = null;

    // function 初期アクション実行(event) {
    //     /**
    //  * initアクションの処理
    //  * ユーザーにトークンを生成し、キャッシュに保存して返す
    //  * @returns {GoogleAppsScript.Content.TextOutput}
    //  */
    // function handleInitAction() {
    //   const token = generateToken(TOKEN_LENGTH);
    //   const nextQuestionTime = new Date(Date.now() + COOL_DOWN_SECONDS * 1000);
    //   const expirationTime = new Date(Date.now() + EXPIRATION_SECONDS * 1000);
    //   const currentTime = new Date();

    //   const output = {
    //     token: token,
    //     next_question_time: nextQuestionTime.toISOString(),
    //     expiration_time: expirationTime.toISOString(),
    //     message: "トークンを発行しました。発行から30秒間は質問できません。",
    //   };

    //   const lock = LockService.getScriptLock();
    //   lock.waitLock(30000); // ロックの取得を最大30秒待つ
    //   try {
    //     const cache = CacheService.getScriptCache();
    //     if (!cache) {
    //       Logger.log("キャッシュの取得に失敗しました。");
    //       throw new Error("キャッシュの取得に失敗しました。");
    //     }

    //     let cachedUserTokens = cache.get(USER_TOKENS_KEY);
    //     let userTokens = cachedUserTokens ? JSON.parse(cachedUserTokens) : {};
    //     userTokens[token] = {
    //       current_time: currentTime,
    //       next_question_time: nextQuestionTime.toISOString(),
    //       expiration_time: expirationTime.toISOString(),
    //     };

    //     Logger.log(`トークン: ${token}`);

    //     cache.put(USER_TOKENS_KEY, JSON.stringify(userTokens));

    //     removeExpiredTokens();

    //     return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);

    //   } catch (error) {
    //     Logger.log(`handleInitAction関数でエラーが発生しました: ${error}`);
    //     return ContentService.createTextOutput(`サーバーエラーが発生しました。詳細: ${error}`).setMimeType(ContentService.MimeType.TEXT);
    //   } finally {
    //     lock.releaseLock(); // ロックを解放
    //   }
    // }
    // 上記はサーバーサイドのコードです
    // serverBase + initアクションをfetchで実行してトークンを取得し、
    // userTokenに保持する,next_question_timeを保持する
    // id:next-question-secondにnext_question_timeまでの秒数を表示する
    // 表示形式は「次の質問までxx秒」
    // 1秒毎に再描画する
    // next_question_timeまで達したらid:question-buttonのdisabledを外し、
    // id:next-question-secondを非表示にする
    /** @type{ons.OnsButtonElement} */
    const questionButton = document.getElementById('question-button');
    const nextQuestionSecondElement = document.getElementById('next-question-second');
    questionButton.disabled = true;
    nextQuestionSecondElement.textContent = "";
    nextQuestionSecondElement.style.visibility = 'visible';

    try {
        const response = await fetch(serverBase + '?action=init');
        const data = await response.json();

        userToken = data.token;
        next_question_time = new Date(data.next_question_time);
        expiration_time = new Date(data.expiration_time);
        server_time = new Date(data.server_time);

        if (!(userToken | next_question_time | server_time)) {
            throw new Exception("初期化エラー")
        }

        let now = server_time;
        const questionButtonElement = document.getElementById('question-button');
        const updateNextQuestionTime = () => {
            const diff = next_question_time - now;
            if (diff > 0) {
                nextQuestionSecondElement.textContent = `質問できるまで${Math.floor(diff / 1000)}秒`;
            } else {
                questionButtonElement.disabled = false;
                //nextQuestionSecondElement.style.display = 'none';
                //visibilityで非表示にする
                nextQuestionSecondElement.style.visibility = 'hidden';
                clearInterval(intervalId);
            }

            //nowに1秒追加
            now = new Date(now.getTime() + 1000);
        };
        const intervalId = setInterval(updateNextQuestionTime, 1000);
        updateNextQuestionTime();
    } catch (error) {
        console.error('初期化に失敗しました:', error);
        nextQuestionSecondElement.textContent = 'エラーが発生しました';
    }

}

async function 質問発行(event) {
    //expiration_timeを過ぎていたら初期アクション実行();
    if (expiration_time < new Date()) {
        初期アクション実行();
        return;
    }

    //     /**
    //  * questionアクションの処理
    //  * トークンを確認し、クールダウン時間経過後であれば質問を受け付ける。
    //  * クールダウン時間内ならエラーを返す。
    //  * @param {GoogleAppsScript.Events.DoGet} e
    //  * @returns {GoogleAppsScript.Content.TextOutput}
    //  */
    // function handleQuestionAction(e) {
    //   let output = null;
    //   try {
    //     const token = e.parameter.token;
    //     const regionCode = e.parameter.region;
    //     const question = e.parameter.question;
    //     let nonBlankValues = null;
    //      ................
    //     const retValue = callGeminiApiWithValues(question, nonBlankValues);
    // // 結果をJSON形式で返す
    //     output = {
    //       regionCode: Number(regionCode),
    //       question: question,
    //       tvProgram: nonBlankValues,
    //       response: retValue,
    //       message: "質問に答えました",
    //     };
    //     return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
    //   } catch (error) {
    //     Logger.log(`handleQuestionAction関数でエラーが発生しました: ${error}`);
    //     return ContentService.createTextOutput(`サーバーエラーが発生しました。詳細: ${error}`).setMimeType(ContentService.MimeType.TEXT);
    //   }
    // }
    // 上記はサーバー側のコード
    // id:ons-modal1をvisibleにしてから
    // serverBase + action=question +トークン＋質問内容をパラメータに含めてフェッチ
    // ひとまずデータ取得までを実装して
    /** @type{ons.OnsModalElement} */
    const modal = document.getElementById('ons-modal1');
    modal.visible = true;
    const selectRegions = document.querySelector('#select-regions');
    const regionCode = selectRegions.value;
    const questionText = document.getElementById('question-text');
    const question = questionText.value;

    const bangumiList = document.getElementById('bangumi-list');
    bangumiList.textContent = '';
    try {
        const response = await fetch(serverBase + '?action=question&token=' + userToken + '&region=' + regionCode + '&question=' + question)
        const contentType = response.headers.get('content-type');

        if (contentType.includes("text/plain")) throw new Error(await response.text());

        const data = await response.json();
        // console.log(data);

        // data.responseは配列
        // 配列の中身のサンプルは以下のもの
        // comment
        // : 
        // "芸能人の山下健二郎が出演。浅野忠信のGG賞受賞についても触れられている。"
        // link
        // : 
        // "/schedule/122544202501140550.action"
        // title
        // : 
        // "ＺＩＰ！[デ]【宮崎で震度５弱…状況は／高校サッカー日本一前橋育英高校が生出演】"
        // data.tvProgramは配列
        // 配列の中身のサンプルは以下のもの
        // genre
        // : 
        // " 情報/ワイドショー"
        // link
        // : 
        // "/schedule/122544202501140445.action"
        // station
        // : 
        // "ＲＡＢ青森放送"
        // summary
        // : 
        // ""
        // time
        // : 
        // "04:45"
        // title
        // : 
        // "ショップジャパン"
        // ここから、tvProgramのlinkをresponseのlinkから探して、
        // genre,station,timeを抽出し、bangumi-list-item-templateテンプレートをコピーして、
        // bangumi-list-item-cardクラスの中身に設定をする



        const titleTemplate = document.getElementById('bangumi-list-item-title');
        const titleClone = document.importNode(titleTemplate.content, true);
        titleClone.textContent = `みたい番組： ${question}`;
        bangumiList.append(titleClone);

        //data.responseの件数がなければ、「番組がないみたい」を追加
        if (data.response.length === 0) {
            const nonElement = document.createElement('ons-list-item');
            nonElement.textContent = '番組がないかも';
            bangumiList.appendChild(nonElement);
        } else {
            let listContent = [];
            data.response.forEach(responseItem => {
                const template = document.getElementById('bangumi-list-item-template');
                const clone = document.importNode(template.content, true);

                const tvProgramItem = data.tvProgram.find(tvProgram => tvProgram.link === responseItem.link);
                if (tvProgramItem) {
                    clone.querySelector('.bangumi-list-item-title').textContent = tvProgramItem.title;
                    clone.querySelector('.bangumi-list-item-genre').textContent = tvProgramItem.genre;
                    clone.querySelector('.bangumi-list-item-station').textContent = tvProgramItem.station;
                    clone.querySelector('.bangumi-list-item-time').textContent = tvProgramItem.time;
                    clone.querySelector('.bangumi-list-item-link').href = `https://www.tvkingdom.jp${tvProgramItem.link}`;
                    clone.querySelector('.bangumi-list-item-comment').textContent = responseItem.comment;
                    listContent.push(clone);
                }
            });
            // listContentのアイテムのbangumi-list-item-timeの時刻の昇順で並べ替える
            // ただし、00:00から04:59までは翌日なので後ろにソートする
            // listContent.sort((a, b) => {
            //     const timeA = a.querySelector('.bangumi-list-item-time').textContent;
            //     const timeB = b.querySelector('.bangumi-list-item-time').textContent;
            //     const [hourA, minuteA] = timeA.split(':').map(Number);
            //     const [hourB, minuteB] = timeB.split(':').map(Number);
            //     if (hourA === 0 && minuteA < 59) {
            //         return 1;
            //     } else if (hourB === 0 && minuteB < 59) {
            //         return -1;
            //     } else {
            //         return hourA === hourB ? minuteA - minuteB : hourA - hourB;
            //     }
            // });

            // listContentのアイテムのbangumi-list-item-timeの時刻の昇順で並べ替える
            // ただし例えば現在時刻が10時なら01時から09時は翌日のデータなので別の配列に移動してソートする
            // その他はそのままソートする
            // 翌日のデータは本日のデータの後ろに追加する
            // 現在時刻を取得
            const nowHour = new Date().getHours();
            // 翌日のデータと本日のデータを分ける
            const nextDayData = listContent.filter(item => {
                const time = item.querySelector('.bangumi-list-item-time').textContent;
                const [hour, minute] = time.split(':').map(Number);
                return hour < nowHour;
            });
            const todayData = listContent.filter(item => {
                const time = item.querySelector('.bangumi-list-item-time').textContent;
                const [hour, minute] = time.split(':').map(Number);
                return hour >= nowHour;
            });
            // 翌日のデータを時刻の昇順でソート
            nextDayData.sort((a, b) => {
                const timeA = a.querySelector('.bangumi-list-item-time').textContent;
                const timeB = b.querySelector('.bangumi-list-item-time').textContent;
                const [hourA, minuteA] = timeA.split(':').map(Number);
                const [hourB, minuteB] = timeB.split(':').map(Number);
                return hourA === hourB ? minuteA - minuteB : hourA - hourB;
            });
            // 本日のデータを時刻の昇順でソート
            todayData.sort((a, b) => {
                const timeA = a.querySelector('.bangumi-list-item-time').textContent;
                const timeB = b.querySelector('.bangumi-list-item-time').textContent;
                const [hourA, minuteA] = timeA.split(':').map(Number);
                const [hourB, minuteB] = timeB.split(':').map(Number);
                return hourA === hourB ? minuteA - minuteB : hourA - hourB;
            });
            // ソートされたデータを結合
            listContent = [...todayData, ...nextDayData];

            if (listContent.length === 0) {
                const nonElement = document.createElement('ons-list-item');
                nonElement.textContent = '番組がないかも';
                bangumiList.appendChild(nonElement);
            } else {
                //listContetの内容をbangumiListに追加する
                listContent.forEach(item => {
                    bangumiList.appendChild(item);
                    
                    // // id:admax-templateからadmax-containerを作り
                    // // bangumiListに追加する
                    // const admaxTemplate = document.getElementById('admax-template');
                    // const admaxContainer = document.importNode(admaxTemplate.content, true);
                    // bangumiList.appendChild(admaxContainer);
                });
            }
        }
        questionText.value = "";
    } catch (error) {
        console.error('質問発行に失敗しました:', error);
        const nonElement = document.createElement('ons-list-item');
        nonElement.textContent = 'エラーが発生しました';
        bangumiList.appendChild(nonElement);
    } finally {
        modal.visible = false;
        初期アクション実行();
    }
}

function 初回起動時(event) {
    // localStorageのnanimiru-appのsettingsに、初回起動時のメッセージをみたフラグがなければ、
    // chiiki-popoverを表示し、次へボタンが押されたらkensaku-popoverを表示し、次へボタンが押されたら、shitumon-popoverを表示し、OKボタンが押されたらフラグを設定して次回以降は表示されないようにする
    const nanimiruAppStore = JSON.parse(localStorage.getItem('nanimiru-app')) || {};
    const settings = nanimiruAppStore.settings || {};
    if (!settings.sawFirstTimeMessage) {
        const chiikiPopover = document.getElementById('chiiki-popover');
        chiikiPopover.show();
        chiikiPopover.querySelector('.next-button').addEventListener('click', () => {
            chiikiPopover.hide();
            const kensakuPopover = document.getElementById('kensaku-popover');
            kensakuPopover.show();
            kensakuPopover.querySelector('.next-button').addEventListener('click', () => {
                kensakuPopover.hide();
                const shitumonPopover = document.getElementById('shitumon-popover');
                shitumonPopover.show();
                shitumonPopover.querySelector('.ok-button').addEventListener('click', () => {
                    shitumonPopover.hide();
                    settings.sawFirstTimeMessage = true;
                    nanimiruAppStore.settings = settings;
                    localStorage.setItem('nanimiru-app', JSON.stringify(nanimiruAppStore));
                });
            });
        });
    }
}

function 設定リセット(event) {
    // リセットしてよいかの確認ダイアログを表示して、OKボタンが押されたらlocalStorageのnanimiru-appをすべて削除する
    // リセット確認ダイアログを表示
    ons.notification.confirm({
        message: '設定をリセットしますか？',
        title: '確認',
        buttonLabels: ['キャンセル', 'OK'],
        callback: (index) => {
            if (index === 1) { // OKボタンが押された場合
                localStorage.removeItem('nanimiru-app');
                
                //リロードする
                location.reload();
            }
        }
    });
}

document.addEventListener('init', (event) => {
    let page = event.target;
    if (page.id === 'ons-page1') {
        let questionbutton_element = document.querySelector('#question-button');
        if(questionbutton_element) {
            questionbutton_element.addEventListener('click', 質問発行);
            page.addEventListener('destroy', function(event) {
                questionbutton_element.removeEventListener('click', 質問発行);
            }, { 'once' : true });
        }
        let onsselectregions_element = document.querySelector('#ons-select-regions');
        if(onsselectregions_element) {
            onsselectregions_element.addEventListener('change', 地域選択);
            page.addEventListener('destroy', function(event) {
                onsselectregions_element.removeEventListener('change', 地域選択);
            }, { 'once' : true });
        }
        地域マスタ取得(event);
        初期アクション実行(event);
        初回起動時(event);
    }
});
document.addEventListener('init', (event) => {
    let page = event.target;
    if (page.id === 'ons-page2') {
        let onslistitem1_element = document.querySelector('#ons-list-item1');
        if(onslistitem1_element) {
            onslistitem1_element.addEventListener('click', 設定リセット);
            page.addEventListener('destroy', function(event) {
                onslistitem1_element.removeEventListener('click', 設定リセット);
            }, { 'once' : true });
        }
    }
});
