let gap = 55 || 60;
let zenLeft = 934 || 952;
let sprintLeft = 950 || 968;
const sdSpeed = 50;
let hdSpeed = 36;
let left = zenLeft || sprintLeft;
let height = 380 || 392;

const speed = document.createElement('input');
speed.value = hdSpeed;
speed.style.position = 'fixed';
speed.style.top = '0px';
speed.style.right = '0px';
speed.addEventListener('change', (e) => {
    hdSpeed = +(e.target.value)
})

const zen = document.createElement('input');
zen.value = zenLeft;
zen.style.position = 'fixed';
zen.style.top = '20px';
zen.style.right = '0px';
zen.addEventListener('change', (e) => {
    zenLeft = +(e.target.value)
    initNexts()
})

const sprint = document.createElement('input');
sprint.value = sprintLeft;
sprint.style.position = 'fixed';
sprint.style.top = '40px';
sprint.style.right = '0px';
sprint.addEventListener('change', (e) => {
    sprintLeft = +(e.target.value)
    initNexts()
})

const gapInput = document.createElement('input');
gapInput.value = gap;
gapInput.style.position = 'fixed';
gapInput.style.top = '60px';
gapInput.style.right = '0px';
gapInput.addEventListener('change', (e) => {
    gap = +(e.target.value)
    initNexts()
})

const heightInput = document.createElement('input');
heightInput.value = height;
heightInput.style.position = 'fixed';
heightInput.style.top = '80px';
heightInput.style.right = '0px';
heightInput.addEventListener('change', (e) => {
    height = +(e.target.value)
    initNexts()
})

const textarea = document.createElement('textarea');
textarea.style.position = 'fixed';
textarea.style.top = '300px';
textarea.style.left = '0px';
textarea.cols = 6;
textarea.height = 100;

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
preview.style.height = `${gap*5}px`;
preview.width = 150;
preview.height = gap*5;
const video = document.createElement('video');
const body = document.body;
body.appendChild(speed);
body.appendChild(zen);
body.appendChild(sprint);
body.appendChild(gapInput);
body.appendChild(heightInput);
body.appendChild(preview);
body.appendChild(textarea);
let ingame_chat;

let nexts = []
function initNexts(){
    nexts = []
    for(let i = 0; i < 5; i++){
        nexts.push([left, height + Math.round(gap * i)])
    }
}
initNexts()

let stat = 1
let ingame = false
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
}
window.onresize = resize;
resize()

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function setColor(e){
    const rgb = ctx1.getImageData(e.clientX, e.clientY, 1, 1).data
    color.value = rgbToHex(rgb[0], rgb[1], rgb[2])
}

function getColor(x, y){
    const rgb = ctx1.getImageData(x, y, 1, 1).data
    return rgbToHex(rgb[0], rgb[1], rgb[2])
}

const keys = {
    "moveLeft":"Comma",
    "moveRight":"Slash",
    "softDrop":"Period",
    "hardDrop":"Space",
    "rotateOtherclock":"KeyA",
    "rotateClock":"KeyD",
    "rotate180":"KeyS",
    "hold":"KeyC"
}

const minoColorMap = {
    'b44': 'z',
    'b34': 'z',
    'b33': 'z',
    '8b3': 's',
    '8b4': 's',
    '9c4': 's',
    'a49': 't',
    'b63': 'l',
    'b64': 'l',
    'c74': 'l',
    'b73': 'l',
    '54a': 'j',
    '65b': 'j',
    'db5': 'o',
    'cb5': 'o',
    'cb4': 'o',
    'ca4': 'o',
    '5da': 'i',
    '4da': 'i',
    '4c9': 'i',
    '4b9': 'i',

    'c55':'z',
    'cc5':'o',
    '8c5':'s',
    '65c':'j',
    '5ca':'i',
    'c5c':'t',
    'c85':'l',
}

function initGame(){
    // console.log(Math.min(canvas.clientWidth, canvas.clientHeight * 1.65))
    let varDir = ''
    let varRoute = ''
    let build = ''
    let varRoof = false
    let varDpc = ''
    let cur = ''
    let hold = ''
    let prevNexts = []
    let placedMinos = []
    let actionQueue = []
    resize()
    const loop = () => {
        if(ingame){
            ctx1.drawImage(video, 0+offsetPos.x, 0+offsetPos.y, c1.width, c1.height);
            const nextColors = nexts.map(next => getColor(next[0], next[1]))
            const nextMinos = nextColors.map(v => minoColorMap[v[1]+v[3]+v[5]])
            const nextViews = nextColors.map(v => `${minoColorMap[v[1]+v[3]+v[5]]} ${v[1]+v[3]+v[5]}`)

            // write placed minos
            textarea.value = nextViews.join('\n')

            if(nextMinos.join('') !== prevNexts.join('')){
                // update placed minos
                cur = prevNexts[0]
                prevNexts = nextMinos

                // draw nexts
                ctx2.clearRect(0, 0, preview.width, preview.height);
                nexts.forEach((next, i) => {
                    let nextImg = ctx1.getImageData(next[0]-75, next[1]-(gap/2), 150, gap)
                    ctx2.putImageData(nextImg, 0, gap * i);
                    ctx2.fillRect(75, gap/2 + gap*i, 2, 2);
                })

                // check build possibility
                if(placedMinos.length === 0) switch(true){
                    case !(findNextsIdx(nextMinos, 't') < findNextsIdx(nextMinos, 'o') && findNextsIdx(nextMinos, 's') < findNextsIdx(nextMinos, 'o')): build = 'sdpc'; break;
                    case !(findNextsIdx(nextMinos, 'l') < findNextsIdx(nextMinos, 't') && findNextsIdx(nextMinos, 's') < findNextsIdx(nextMinos, 'l')): build = 'tfac'; break;
                }

                // start build
                switch(build){
                    case 'sdpc': sdpcPattern(nextMinos); break;
                    case 'tfac': tfacPattern(nextMinos); break;
                    case 'dpc': dpc(nextMinos); break;
                }
            }
            setTimeout(loop, 1000 / 60); // drawing at 60fps
        }
    }
    loop() // start the drawing loop.
    const actionLoop = () => {
        if(ingame){
            if(actionQueue.length === 0) return setTimeout(actionLoop, 10)
            const action = actionQueue.shift()
            action.type === 'tap' ? keyTap(action.keytype) : action.type === 'press' ? pressKey(action.keytype) : releaseKey(action.keytype)
            const delay = action.type === 'press' ? sdSpeed : hdSpeed
            setTimeout(actionLoop, delay)
        }
    }
    actionLoop()

    function findNextsIdx(nexts, mino, onlyNext = false){
        return onlyNext ? nexts.indexOf(mino) === -1 ? 99 : nexts.indexOf(mino) : cur === mino || hold === mino ? -1 : nexts.indexOf(mino) === -1 ? 99 : nexts.indexOf(mino)
    }

    function sdpcPattern(nexts){
        const bag = Math.floor(placedMinos.length / 7) % 5
        const bagIndex = placedMinos.length % 7
        switch(bag){
            case 0:
                switch(cur){
                    case 't':
                        if(bagIndex === 6){
                            addQueue('press', 'softDrop')
                            addQueue('release', 'softDrop')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'rotate180')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('t')
                        } else {
                            doHold()
                        }
                        break;
                    case 'z':
                        if(bag >= placedCount('z')){
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('z')
                        } else {
                            doHold()
                        }
                        break;
                    case 's':
                        if(bag >= placedCount('s')){
                            if(placedCount('o') >= 1){
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('s')
                            } else {
                                doHold()
                            }
                        } else {
                            doHold()
                        }
                        break;
                    case 'o':
                        if(bag >= placedCount('o')){
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('o')
                        } else {
                            doHold()
                        }
                        break;
                    case 'i':
                        if(bag >= placedCount('i')){
                            addQueue('tap', 'rotateOtherclock')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('i')
                        } else {
                            doHold()
                        }
                        break;
                    case 'l':
                        if(bag >= placedCount('l')){
                            if(placedCount('j') >= 1){
                                if(placedCount('z') >= 1){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('press', 'softDrop')
                                    addQueue('release', 'softDrop')
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                } else {
                                    addQueue('tap', 'rotate180')
                                    addQueue('press', 'softDrop')
                                    addQueue('release', 'softDrop')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                }
                            } else {
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('l')
                            }
                        } else {
                            doHold()
                        }
                        break;
                    case 'j':
                        if(bag >= placedCount('j')){
                            if(placedCount('l') >= 1){
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            } else {
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            }
                        } else {
                            doHold()
                        }
                        break;
                }
                break;
            case 1:
                switch(cur){
                    case 't':
                        if(bagIndex === 6){
                            addQueue('tap', 'rotateOtherclock')
                            addQueue('tap', 'moveRight')
                            addQueue('press', 'softDrop')
                            addQueue('release', 'softDrop')
                            addQueue('tap', 'rotateOtherclock')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('t')
                        } else {
                            doHold()
                        }
                        break;
                    case 'z':
                        if(bag >= placedCount('z')){
                            if(placedCount('j') > placedCount('z')){
                                addQueue('tap', 'rotateClock')
                                addQueue('press', 'softDrop')
                                addQueue('release', 'softDrop')
                                addQueue('tap', 'rotateClock')
                            }
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('z')
                        } else {
                            doHold()
                        }
                        break;
                    case 's':
                        if(bag >= placedCount('s')){
                            addQueue('tap', 'rotateClock')
                            addQueue('tap', 'moveRight')
                            if(placedCount('o') > placedCount('s')){
                                addQueue('press', 'softDrop')
                                addQueue('release', 'softDrop')
                            }
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('s')
                        } else {
                            doHold()
                        }
                        break;
                    case 'o':
                        if(bag >= placedCount('o')){
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('o')
                        } else {
                            doHold()
                        }
                        break;
                    case 'i':
                        if(bag >= placedCount('i')){
                            addQueue('tap', 'rotateClock')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('i')
                        } else {
                            doHold()
                        }
                        break;
                    case 'l':
                        if(bag >= placedCount('l')){
                            addQueue('tap', 'rotate180')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('l')
                        } else {
                            doHold()
                        }
                        break;
                    case 'j':
                        if(bag >= placedCount('j')){
                            if(placedCount('l') > placedCount('j')){
                                if(placedCount('z') > placedCount('j')){
                                    addQueue('press', 'softDrop')
                                    addQueue('release', 'softDrop')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                } else {
                                    if(placedCount('s') > placedCount('j')){
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveRight')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotate180')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('j')
                                    } else {
                                        addQueue('tap', 'moveRight')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('j')
                                    }
                                }
                            } else {
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            }
                        } else {
                            doHold()
                        }
                        break;
                }
                break;
            case 2:
                if(bagIndex === 6) {
                    varRoof = false
                    varRoute = ''
                    build = 'dpc'
                    dpc(nexts)
                }else {
                    if(varRoute === ''){
                        if(findNextsIdx(nexts, 'j') < findNextsIdx(nexts, 'l')){
                            varRoute = 'j'
                        } else {
                            varRoute = 'l'
                        }
                    }
                    if(cur === 'o'){
                        addQueue('tap', 'moveLeft')
                        addQueue('tap', 'moveLeft')
                        addQueue('tap', 'moveLeft')
                        addQueue('tap', 'moveLeft')
                        addQueue('tap', 'hardDrop')
                        placedMinos.push('o')
                    } else if((cur === 't' || hold === 't') && !varRoof){
                        if(hold === 't') doHold(true)
                        addQueue('tap', 'rotateClock')
                        addQueue('tap', 'moveLeft')
                        addQueue('press', 'softDrop')
                        addQueue('release', 'softDrop')
                        addQueue('tap', 'rotateClock')
                        addQueue('tap', 'hardDrop')
                        placedMinos.push('t')
                    } else if (cur === 't' && varRoof){
                        if(bagIndex === 5){
                            addQueue('tap', 'rotate180')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('t')
                        } else {
                            doHold()
                        }
                    } else if (cur === 'j'){
                        if(varRoute === 'j'){
                            if(placedCount('i') > placedCount('j')){
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'moveLeft')
                                addQueue('press', 'softDrop')
                                addQueue('tap', 'rotate180')
                                addQueue('tap', 'rotate180')
                                addQueue('release', 'softDrop')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            } else {
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            }
                        } else {
                            if(placedCount('z') > placedCount('j')){
                                addQueue('tap', 'rotate180')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('j')
                            } else {
                                doHold()
                            }
                        }
                    } else if(cur === 'l'){
                        if(varRoute === 'l'){
                            addQueue('tap', 'rotate180')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('l')
                        } else {
                            if(findNextsIdx('z') < findNextsIdx('s')){
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('l')
                            } else if (placedCount('s') > placedCount('l')){
                                addQueue('tap', 'rotateOtherclock')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('l')
                            } else if(placedCount('z') > placedCount('l')) {
                                addQueue('tap', 'rotateOtherclock')
                                addQueue('press', 'softDrop')
                                addQueue('release', 'softDrop')
                                addQueue('tap', 'rotateClock')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('l')
                            } else {
                                doHold()
                            }
                        }
                    } else if(cur === 'i'){
                        if(varRoute === 'l'){
                            addQueue('tap', 'rotateClock')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('i')
                        } else {
                            if(placedCount('j') > placedCount('i')){
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('i')
                            } else if ((hold === 'z' || (!varRoof && hold === 'l')) && placedCount('t') <= placedCount('i')){
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'moveRight')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('i')
                            } else {
                                doHold()
                            }
                        }
                    } else if(cur === 's'){
                        if(varRoute === 'j'){
                            if(placedCount('t') > placedCount('s') || (!varRoof && hold === 'l')){
                                if(placedCount('z') > placedCount('s')){
                                    doHold()
                                } else {
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('s')
                                    varRoof = true
                                }
                            } else {
                                doHold()
                            }
                        } else if(varRoute === 'l') {
                            doHold()
                        }
                    } else if(cur === 'z'){
                        if(varRoute === 'l'){
                            if(placedCount('t') > placedCount('z') || hold === 's' || (!varRoof && hold === 'j')){
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('z')
                                varRoof = true
                            } else {
                                doHold()
                            }
                        } else if(varRoute === 'j') {
                            if(placedCount('j') > placedCount('z') && placedCount('t') <= placedCount('z') && !varRoof){
                                addQueue('tap', 'moveLeft')
                                addQueue('tap', 'hardDrop')
                                placedMinos.push('z')
                                varRoof = true
                            } else {
                                doHold()
                            }
                        }
                    }
                }
                break;
        }
    }
    
    function dpc(nexts){
        if(varDpc === '') varDpc = hold
        const bag = Math.floor(placedMinos.length / 7) % 5
        const bagIndex = placedMinos.length % 7
        if(bag === 0){
            varDpc = ''
            varRoute = ''
            varDir = ''
            build = 'sdpc'
            placedMinos = []
            sdpcPattern(nexts)
        } else {
            switch(varDpc){
                case 'z':
                    if(bag === 2) {
                        varRoute = (findNextsIdx(nexts, 'o') < findNextsIdx(nexts, 'z', true) || findNextsIdx(nexts, 'o') < findNextsIdx(nexts, 't', true)) ? 'zoz' : 'zzo'
                        doHold(true)
                        if(varRoute === 'zoz'){
                            addQueue('tap', 'rotateClock')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('z')
                        } else {
                            addQueue('tap', 'hardDrop')
                            placedMinos.push('z')
                        }
                    } else if(bag === 3) {
                        switch(cur){
                            case 'o':
                                if(bag < placedCount('o')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('o')
                                } else {
                                    if(placedCount('z') > placedCount('o')){
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('o')
                                    } else {
                                        doHold()
                                    }
                                }
                                break;
                            case 's':
                                if(bag < placedCount('s')) return doHold()
                                if(varRoute === 'zoz'){
                                    if(placedCount('l') > placedCount('s')){
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')  
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('s')
                                    } else {
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('s')
                                    }
                                } else {
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    if(placedCount('j') > placedCount('s')){
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'rotateClock')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateClock')
                                    }
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('s')
                                }
                                break;
                            case 'z':
                                if(bag < placedCount('z')) return doHold()
                                if(varRoute === 'zoz'){
                                    if(placedCount('o') > placedCount('z')){
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('z')
                                    } else {
                                        doHold()
                                    }
                                } else {
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('z')
                                }
                                break;
                            case 'i':
                                if(bag < placedCount('i')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                } else {
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                }
                                break;
                            case 'l':
                                if(bag < placedCount('l')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                } else {
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    if(placedCount('z') > placedCount('l')){
                                        addQueue('tap', 'moveRight')
                                        if(placedCount('i') > placedCount('l')){addQueue('tap', 'rotateOtherclock')}
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        if(placedCount('i') > placedCount('l')){addQueue('tap', 'rotateClock')}
                                        addQueue('tap', 'moveLeft')
                                    }
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                }
                                break;
                            case 'j':
                                if(bag < placedCount('j')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                } else {
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                }
                                break;
                            case 't':
                                if(bagIndex === 6){
                                    if(varRoute === 'zoz'){
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    } else {
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    }
                                } else {
                                    doHold()
                                }
                                break;
                        }
                    } else if(bag === 4){
                        switch(cur){
                            case 'o':
                                if(bag < placedCount('o')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('o')
                                } else {
                                    //
                                }
                                break;
                            case 'l':
                                if(bag < placedCount('l')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                } else {
                                    //
                                }
                                break;
                            case 's':
                                if(bag < placedCount('s')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('s')
                                } else {
                                    //
                                }
                                break;
                            case 't':
                                if(bag < placedCount('t')) return doHold()
                                if(varRoute === 'zoz'){
                                    if(placedCount('j') > placedCount('t')){
                                        if(placedCount('z') > placedCount('t')){
                                            addQueue('tap', 'rotate180')
                                            addQueue('tap', 'moveRight')
                                            addQueue('tap', 'hardDrop')
                                            placedMinos.push('t')
                                        } else {
                                            doHold()
                                        }
                                    } else {
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 'j':
                                if(bag < placedCount('j')) return doHold()
                                if(varRoute === 'zoz'){
                                    if(placedCount('t') > placedCount('j')){
                                        addQueue('tap', 'rotate180')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('j')
                                    } else {
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('j')
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 'z':
                                if(bag < placedCount('z')) return doHold()
                                if(varRoute === 'zoz'){
                                    if(placedCount('j') > placedCount('z') || placedCount('t') > placedCount('z')){
                                        if(firstInLastBag('j', 't') == 'j'){
                                            addQueue('tap', 'rotateClock')
                                            addQueue('tap', 'moveRight')
                                            addQueue('tap', 'moveRight')
                                            addQueue('tap', 'hardDrop')
                                            placedMinos.push('z')
                                        } else {
                                            if(placedCount('s') > placedCount('z')){
                                                addQueue('tap', 'moveRight')
                                                if(placedCount('j') > placedCount('z')){
                                                    addQueue('tap', 'moveRight')
                                                    addQueue('tap', 'rotateOtherclock')
                                                    addQueue('press', 'softDrop')
                                                    addQueue('release', 'softDrop')
                                                    addQueue('tap', 'rotateOtherclock')
                                                }
                                                addQueue('tap', 'hardDrop')
                                                placedMinos.push('z')
                                            } else {
                                                doHold()
                                            }
                                        }
                                    } else {
                                        doHold()
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 'i':
                                if(bag < placedCount('i')) return doHold()
                                if(varRoute === 'zoz'){
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                } else {
                                    //
                                }
                                break;
                        }
                    }
                    break;
                case 's':
                    if(bag === 2) {
                        varRoute = (findNextsIdx(nexts, 'o') < findNextsIdx(nexts, 's', true) || findNextsIdx(nexts, 'o') < findNextsIdx(nexts, 't', true)) ? 'sos' : 'sso'
                        doHold(true)
                        if(varRoute === 'sos'){
                            addQueue('tap', 'rotateOtherclock')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'moveLeft')
                            addQueue('tap', 'hardDrop')
                        } else {
                            addQueue('tap', 'moveRight')
                            addQueue('tap', 'hardDrop')
                        }
                        placedMinos.push('s')
                        console.log('bag2', placedMinos)
                    } else if(bag === 3) {
                        switch(cur){
                            case 'o':
                                if(bag < placedCount('o')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('o')
                                } else {
                                    if(placedCount('s') > placedCount('o')){
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('o')
                                    } else {
                                        doHold()
                                    }
                                }
                                break;
                            case 'z':
                                if(bag < placedCount('z')) return doHold()
                                if(varRoute === 'sos'){
                                    if(placedCount('j') > placedCount('z')){
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'rotateClock')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')  
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('z')
                                    } else {
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('z')
                                    }
                                } else {
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    if(placedCount('l') > placedCount('z')){
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateOtherclock')
                                    }
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('z')
                                }
                                break;
                            case 's':
                                console.log(bag, placedCount('s'), placedMinos)
                                if(bag < placedCount('s')) return doHold()
                                if(varRoute === 'sos'){
                                    if(placedCount('o') > placedCount('s')){
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('s')
                                    } else {
                                        doHold()
                                    }
                                } else {
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('s')
                                }
                                break;
                            case 'i':
                                if(bag < placedCount('i')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                } else {
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                }
                                break;
                            case 'j':
                                if(bag < placedCount('j')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                } else {
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    if(placedCount('s') > placedCount('j')){
                                        addQueue('tap', 'moveLeft')
                                        if(placedCount('i') > placedCount('l')){addQueue('tap', 'rotateClock')}
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        if(placedCount('i') > placedCount('l')){addQueue('tap', 'rotateOtherclock')}
                                        addQueue('tap', 'moveRight')
                                    }
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                }
                                break;
                            case 'l':
                                if(bag < placedCount('l')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                } else {
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('l')
                                }
                                break;
                            case 't':
                                if(bagIndex === 6){
                                    if(varRoute === 'sos'){
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'moveRight')
                                        addQueue('tap', 'moveRight')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    } else {
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('press', 'softDrop')
                                        addQueue('release', 'softDrop')
                                        addQueue('tap', 'rotateOtherclock')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    }
                                } else {
                                    doHold()
                                }
                                break;
                        }
                    } else if(bag === 4){
                        switch(cur){
                            case 'o':
                                if(bag < placedCount('o')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('o')
                                } else {
                                    //
                                }
                                break;
                            case 'j':
                                if(bag < placedCount('j')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'rotateClock')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('j')
                                } else {
                                    //
                                }
                                break;
                            case 'z':
                                if(bag < placedCount('z')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveRight')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('z')
                                } else {
                                    //
                                }
                                break;
                            case 't':
                                if(bag < placedCount('t')) return doHold()
                                if(varRoute === 'sos'){
                                    if(placedCount('l') > placedCount('t')){
                                        if(placedCount('s') > placedCount('t')){
                                            addQueue('tap', 'rotate180')
                                            addQueue('tap', 'hardDrop')
                                            placedMinos.push('t')
                                        } else {
                                            doHold()
                                        }
                                    } else {
                                        addQueue('tap', 'moveLeft') 
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('t')
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 'l':
                                if(bag < placedCount('l')) return doHold()
                                if(varRoute === 'sos'){
                                    if(placedCount('t') > placedCount('l')){
                                        addQueue('tap', 'rotate180')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('l')
                                    } else {
                                        addQueue('tap', 'rotateClock')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'moveLeft')
                                        addQueue('tap', 'hardDrop')
                                        placedMinos.push('l')
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 's':
                                if(bag < placedCount('s')) return doHold()
                                if(varRoute === 'sos'){
                                    if(placedCount('l') > placedCount('s') || placedCount('t') > placedCount('s')){
                                        if(firstInLastBag('l', 't') == 'l'){
                                            addQueue('tap', 'rotateOtherclock')
                                            addQueue('tap', 'hardDrop')
                                            placedMinos.push('s')
                                        } else {
                                            if(placedCount('s') > placedCount('s')){
                                                addQueue('tap', 'moveLeft')
                                                if(placedCount('l') > placedCount('s')){
                                                    addQueue('tap', 'moveLeft')
                                                    addQueue('tap', 'rotateClock')
                                                    addQueue('press', 'softDrop')
                                                    addQueue('release', 'softDrop')
                                                    addQueue('tap', 'rotateClock')
                                                }
                                                addQueue('tap', 'hardDrop')
                                                placedMinos.push('s')
                                            } else {
                                                doHold()
                                            }
                                        }
                                    } else {
                                        doHold()
                                    }
                                } else {
                                    //
                                }
                                break;
                            case 'i':
                                if(bag < placedCount('i')) return doHold()
                                if(varRoute === 'sos'){
                                    addQueue('tap', 'rotateOtherclock')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'moveLeft')
                                    addQueue('tap', 'hardDrop')
                                    placedMinos.push('i')
                                } else {
                                    //
                                }
                                break;
                            }
                    }
                    break;
            }
        }
    }

    function tfacPattern(nexts){
        const bag = Math.floor(placedMinos.length / 7)
        const bagIndex = placedMinos.length % 7
        switch(cur){
            case 't':
                if(placedCount('t') == 0){
                    addQueue('tap', 'rotate180')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'hardDrop')
                    placedMinos.push('t')
                } else {
                    // tspin
                    if(placedCount('z') >= placedCount('t') && placedCount('s')  >= placedCount('t')){
                        addQueue('tap', 'rotateOtherclock')
                        addQueue('tap', 'moveRight')
                        addQueue('tap', 'moveRight')
                        addQueue('press', 'softDrop')
                        addQueue('release', 'softDrop')
                        addQueue('tap', 'rotateOtherclock')
                        addQueue('tap', 'hardDrop')
                        placedMinos.push('t')
                    } else {
                        doHold()
                    }
                }
                break;
            case 'z':
                if(placedCount('o') > placedCount('z')){
                    addQueue('tap', 'hardDrop')
                    placedMinos.push('z')
                } else {
                    doHold()
                }
                break;
            case 's':
                if(placedMinos.includes('t')){
                    if(placedCount('l') >= placedCount('s')){
                        addQueue('tap', 'rotateClock')
                        addQueue('tap', 'moveRight')
                        addQueue('tap', 'moveRight')
                        if(placedCount('l') > placedCount('s')){
                            addQueue('press', 'softDrop')
                            addQueue('release', 'softDrop')
                        }
                        addQueue('tap', 'moveRight')
                        addQueue('tap', 'hardDrop')
                        placedMinos.push('s')
                    } else {
                        doHold()
                    }
                } else {
                    doHold()
                }
                break;
            case 'o':
                if(placedCount('z') >= placedCount('o')){
                    addQueue('tap', 'moveLeft')
                    if(placedCount('j') > placedCount('o')){
                        addQueue('press', 'softDrop')
                        addQueue('release', 'softDrop')
                    }
                    addQueue('tap', 'moveLeft')
                    addQueue('tap', 'hardDrop')
                    placedMinos.push('o')
                } else {
                    doHold()
                }
                break;
            case 'i':
                addQueue('tap', 'rotateOtherclock')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'hardDrop')
                placedMinos.push('i')
                break;
            case 'l':
                if(placedMinos.includes('t')){
                    addQueue('tap', 'rotateOtherclock')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'moveRight')
                    addQueue('tap', 'hardDrop')
                    placedMinos.push('l')
                } else {
                    doHold()
                }
                break;
            case 'j':
                addQueue('tap', 'rotateClock')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'moveLeft')
                addQueue('tap', 'hardDrop')
                placedMinos.push('j')
                break;
        }
    }

    function placedCount(mino){
        return placedMinos.filter(v => v === mino).length
    }

    function doHold(onlyHold = false){
        const phold = `${hold}`
        hold = cur
        addQueue('tap', 'hold')
        if(phold !== ''){
            cur = phold
            if(!onlyHold) {
                switch(build){
                    case 'sdpc': sdpcPattern(nexts); break;
                    case 'tfac': tfacPattern(nexts); break;
                    case 'dpc': dpc(nexts); break;
                }
            }
        }
    }

    function addQueue(type, keytype){
        actionQueue.push({type:type, keytype:keytype})
    }

    function firstInLastBag(mino1, mino2){
        const bag = Math.floor(placedMinos.length / 7)
        const bagIndex = placedMinos.length % 7
        const reversed = [...placedMinos].reverse().slice(0, 7-bagIndex)
        const idx1 = reversed.findIndex(v => v === mino1)
        const idx2 = reversed.findIndex(v => v === mino2)
        console.log(idx1, idx2, mino1, mino2)
        return idx1 > idx2 ? mino1 : mino2
    }
}

function pressKey(keytype){
    document.body.dispatchEvent(new KeyboardEvent('keydown', {code: keys[keytype], bubbles:true}))
}
function releaseKey(keytype){
    document.body.dispatchEvent(new KeyboardEvent('keyup', {code: keys[keytype], bubbles:true}))
}
function keyTap(keytype){
    pressKey(keytype)
    releaseKey(keytype)
}


// keybinds
document.addEventListener('keydown', async (e) => {
    if(e.code === 'BracketLeft'){
        console.log(left)
        ingame = true
        initGame()
    } else if(e.code === 'BracketRight'){
        ingame = false
    } else if(e.code === 'Minus'){
        left = zenLeft
        initNexts()
    } else if(e.code === 'Equal'){
        left = sprintLeft
        initNexts()
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
