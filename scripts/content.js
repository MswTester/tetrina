const color = document.createElement('input');
color.type = 'color';
color.style.position = 'fixed';
color.style.top = '0px';
color.style.left = '0px';

const textarea = document.createElement('textarea');
textarea.style.position = 'fixed';
textarea.style.top = '0px';
textarea.style.left = '0px';

const canvas = document.getElementById('pixi');
const chat = document.getElementById('ingame_chat_container');
const menus = document.getElementById('menus');
const c1 = document.createElement('canvas');
const ctx1 = c1.getContext('2d');
const preview = document.createElement('canvas');
const ctx2 = preview.getContext('2d');
preview.style.position = 'fixed';
preview.style.top = '0px';
preview.style.left = '0px';
preview.style.width = '150px';
preview.style.height = '700px';
preview.width = 150;
preview.height = 700;
const video = document.createElement('video');
const body = document.body;
body.appendChild(preview);
let ingame_chat;

let gap = 57;
let height = 378;
let hold = [593, height]
let nexts = []
for(let i = 0; i < 5; i++){
    nexts.push([945, height + gap * i])
}

let stat = 1
let captureStream = null
const offsetPos = {
    x:0,
    y:140
}

const observer = new MutationObserver((mutlist, obs) => {
    if(mutlist[0].attributeName === 'class'){
        if(isBodyStatus('chatbg')){
            stat = 1
            document.removeEventListener('mousemove', setColor)
        }
        if(isBodyStatus('ingame') && isBodyStatus('multiplexed')){
            ingame_chat = chat.getElementById('ingame_chat');
        }
        if(isBodyStatus('ingame_phys') && isBodyStatus('ingame') && stat != 2){
            stat = 2
            initGame()
        }
    }
})

observer.observe(body, {attributes:true})

function isBodyStatus(statusName){
    return body.classList.value.split(' ').includes(statusName)
}

function resize(){
    c1.width = innerWidth;
    c1.height = innerHeight;
    console.log(c1.width, c1.height)
}
window.onresize = resize;
resize()

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function setColor(e){
    console.log(e.clientX, e.clientY)
    const rgb = ctx1.getImageData(e.clientX, e.clientY, 1, 1).data
    color.value = rgbToHex(rgb[0], rgb[1], rgb[2])
}

function getColor(x, y){
    const rgb = ctx1.getImageData(x, y, 1, 1).data
    return rgbToHex(rgb[0], rgb[1], rgb[2])
}

function initGame(){
    console.log(Math.min(canvas.clientWidth, canvas.clientHeight * 1.65))
    resize()
    const loop = () => {
        if(stat === 2){
            ctx1.drawImage(video, 0+offsetPos.x, 0+offsetPos.y, c1.width, c1.height);
            const holdColor = getColor(hold[0], hold[1])
            const nextColors = nexts.map(next => getColor(next[0], next[1]))
            ctx2.clearRect(0, 0, preview.width, preview.height);
            let holdImg = ctx1.getImageData(hold[0]-75, hold[1]-50, 150, 100)
            ctx2.putImageData(holdImg, 0, 0);
            ctx2.fillStyle = 'red';
            ctx2.fillRect(75, 50, 3, 3);
            nexts.forEach((next, i) => {
                let nextImg = ctx1.getImageData(next[0]-75, next[1]-50, 150, 100)
                ctx2.putImageData(nextImg, 0, 100 + gap * i);
                ctx2.fillRect(75, 150 + gap*i, 3, 3);
            })
            setTimeout(loop, 1000 / 60); // drawing at 60fps
        }
    }
    loop() // start the drawing loop.
}

// keybinds
document.addEventListener('keydown', async (e) => {
    if(e.code === 'KeyC'){
        console.log(captureStream)
    }
});

// capture
async function startCapture(){
    try{
        captureStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        })
        video.srcObject = captureStream;
        video.autoplay = true;
        resize()
    } catch(err){
        console.log(err)
    }
}
startCapture()
