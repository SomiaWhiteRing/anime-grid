const Caches = {};
const get = async (url)=>{
    if(Caches[url]) return Caches[url];

    const f = await fetch(url);
    const data = await f.json();
    Caches[url] = data;
    return data;
}




const Images = {};

const loadImage = (src,onOver)=>{
    if(Images[src]) return onOver(Images[src]);
    const el = new Image();
    el.crossOrigin = 'Anonymous';
    el.src = src;
    el.onload = ()=>{
        onOver(el)
        Images[src] = el;
    }
};


const typeTexts = `性癖启蒙
萌二期精神支柱
聊到就滔滔不绝
想尽办法去洗它

见一次就骂一次
睡得很香
坐牢十年才玩完
为它花过很多钱

安利失败一百次
天天听说，从未玩过
大众吹的就该黑
大众黑的就该吹

玩完创作欲爆棚
被骗眼泪一公升
靠下半身追完了`;

const types = typeTexts.trim().split(/\n+/g);


const bangumiLocalKey = 'margiconch-games-grid';


let bangumis = [];


const generatorDefaultBangumis = ()=> {
    bangumis = new Array(types.length).fill(null);
}

const getBangumiIdsText = ()=> bangumis.map(i=>String( i || 0 )).join(',')

const getBangumisFormLocalStorage = ()=>{
    if(!window.localStorage) return generatorDefaultBangumis();

    const bangumisText = localStorage.getItem(bangumiLocalKey);
    if(!bangumisText) return generatorDefaultBangumis();

    bangumis = bangumisText.split(/,/g).map(i=>/^\d+$/.test(i) ? +i : i);
}

getBangumisFormLocalStorage();
const saveBangumisToLocalStorage = ()=>{
    localStorage.setItem(bangumiLocalKey,getBangumiIdsText());
};


const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const bodyMargin = 20;
const contentWidth = 600;
const contentHeight = 560;


const col = 5;
const row = 3;

const colWidth = Math.ceil(contentWidth / col);
const rowHeight = Math.ceil(contentHeight / row);
const titleHeight = 40;
const fontHeight = 24;

const width = contentWidth + bodyMargin * 2;
const height = contentHeight + bodyMargin * 2 + titleHeight;
const scale = 3;


canvas.width = width * scale;
canvas.height = height * scale;

ctx.fillStyle = '#FFF';
ctx.fillRect(
    0,0, 
    width * scale,height * scale
);

ctx.textAlign = 'left';
ctx.font = `${9 * scale}px sans-serif`;
ctx.fillStyle = '#AAA';
ctx.textBaseline = 'middle';
ctx.lineCap  = 'round';
ctx.lineJoin = 'round';
ctx.fillText(
    'thanks for @卜卜口 · anime-grid-game.vercel.app · 游戏信息来自番组计划 · 禁止商业、盈利用途',
    19 * scale,
    (height - 10) * scale
);

ctx.scale(scale,scale);
ctx.translate(
    bodyMargin,
    bodyMargin + titleHeight
);

ctx.font = '16px sans-serif';
ctx.fillStyle = '#222';
ctx.textAlign = 'center';


ctx.save();


ctx.font = 'bold 24px sans-serif';
ctx.fillText('游戏生涯个人喜好表',contentWidth / 2, -24 );




ctx.lineWidth = 2;
ctx.strokeStyle = '#222';

for(let y = 0;y <= row;y++){

    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight);
    ctx.lineTo(contentWidth,y * rowHeight);
    ctx.globalAlpha = 1;
    ctx.stroke();

    if( y === row) break;
    ctx.beginPath();
    ctx.moveTo(0,y * rowHeight + rowHeight - fontHeight);
    ctx.lineTo(contentWidth,y * rowHeight + rowHeight - fontHeight);
    ctx.globalAlpha = .2;
    ctx.stroke();
}
ctx.globalAlpha = 1;
for(let x = 0;x <= col;x++){
    ctx.beginPath();
    ctx.moveTo(x * colWidth,0);
    ctx.lineTo(x * colWidth,contentHeight);
    ctx.stroke();
}
ctx.restore();


for(let y = 0;y < row;y++){

    for(let x = 0;x < col;x++){
        const top = y * rowHeight;
        const left = x * colWidth;
        const type = types[y * col + x];
        ctx.font = (type.length > 7 ? '13px Arial' : '16px Arial');
        ctx.fillText(
            type,
            left + colWidth / 2,
            top + rowHeight - fontHeight / 2,
        );
    }
}

const APIURL = `https://lab.magiconch.com/api/bangumi/`;
const ImageURL = `https://nagisa.magiconch.com/api/bangumi/`;


const getCoverURLById = id => `${ImageURL}game/${id}/cover.jpg`;

let currentBangumiIndex = null;
const searchBoxEl = document.querySelector('.search-bangumis-box');
const formEl = document.querySelector('form');
const searchInputEl = formEl[0];
const gameListEl = document.querySelector('.game-list');

const openSearchBox = (index)=>{
    currentBangumiIndex = index;
    document.documentElement.setAttribute('data-no-scroll',true);
    searchBoxEl.setAttribute('data-show',true);
    
    searchInputEl.focus();

    const value = bangumis[currentBangumiIndex];

    if(!/^\d+$/.test(value)){
        searchInputEl.value = value;
    }
        
}
const closeSearchBox = ()=>{
    document.documentElement.setAttribute('data-no-scroll',false);
    searchBoxEl.setAttribute('data-show',false);
    searchInputEl.value = '';
    formEl.onsubmit();
};
const setInputText = ()=>{
    const text = searchInputEl.value.trim().replace(/,/g,'');
    setCurrentBangumi(text);
}


const setCurrentBangumi =  (value)=>{

    bangumis[currentBangumiIndex] = value;
    saveBangumisToLocalStorage();
    drawBangumis();

    closeSearchBox();
}

gameListEl.onclick = e=>{
    const id = +e.target.getAttribute('data-id');
    if(currentBangumiIndex === null) return;
    setCurrentBangumi(id);
};

formEl.onsubmit = async e=>{
    if(e) e.preventDefault();
    let url = `${APIURL}games`;

    const keyword = searchInputEl.value.trim();
    if(keyword) url = url + `?keyword=${encodeURIComponent(keyword)}`;

    const games = await get(url);
    gameListEl.innerHTML = games.map(game=>{
        return `<div class="game-item" data-id="${game.id}"><img src="${getCoverURLById(game.id)}" crossOrigin="Anonymous"><h3>${game.title}</h3></div>`;
    }).join('');
}

formEl.onsubmit();




const imageWidth = colWidth - 2;
const imageHeight = rowHeight - fontHeight;
const canvasRatio = imageWidth / imageHeight;

ctx.font = 'bold 32px sans-serif';

const drawBangumis = ()=>{
    for(let index in bangumis){
        const id = bangumis[index];
        if(!id) continue;
        const x = index % col;
        const y = Math.floor(index / col);

        if(!/^\d+$/.test(id)){ // 非数字

            console.log(id)
            ctx.clearRect(
                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            )
            ctx.fillText(
                id,
                (x + 0.5) * colWidth,
                (y + 0.5) * rowHeight - 4, 
                imageWidth - 10,
            );
            continue;
        }
        
        loadImage(getCoverURLById(id),el=>{
            const { naturalWidth, naturalHeight } = el;
            const originRatio = el.naturalWidth / el.naturalHeight;

            let sw, sh, sx, sy;
            if(originRatio < canvasRatio){
                sw = naturalWidth
                sh = naturalWidth / imageWidth * imageHeight;
                sx = 0
                sy = (naturalHeight - sh)
            }else{
                sh = naturalHeight
                sw = naturalHeight / imageHeight * imageWidth;
                sx = (naturalWidth - sw)
                sy = 0
            }

            ctx.drawImage(
                el,
                
                sx, sy,
                sw, sh, 

                x * colWidth + 1,
                y * rowHeight + 1, 
                imageWidth,
                imageHeight,
            );
        })
    }
}


const downloadImage = ()=>{
    const fileName = '[游戏生涯个人喜好表].jpg';
    const mime = 'image/jpeg';
    const imgURL = canvas.toDataURL(mime,0.8);
    const linkEl = document.createElement('a');
    linkEl.download = fileName;
    linkEl.href = imgURL;
    linkEl.dataset.downloadurl = [ mime, fileName, imgURL ].join(':');
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
    new Image().src = `${APIURL}grid?ids=${getBangumiIdsText()}`;
}

canvas.onclick = e=>{
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = e;
    const x = Math.floor(((clientX - rect.left) / rect.width * width - bodyMargin) / colWidth);
    const y = Math.floor(((clientY - rect.top) / rect.height * height  - bodyMargin - titleHeight) / rowHeight);

    if(x < 0) return;
    if(x > col) return;
    if(y < 0) return;
    if(y > row) return;

    const index = y * col + x;

    if(index >= col * row) return;

    openSearchBox(index);
}


drawBangumis();