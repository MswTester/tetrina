
const canvas = document.getElementById('pixi');
const chat = document.getElementById('ingame_chat_container');
const menus = document.getElementById('menus');
const body = document.body;
let ingame_chat;

let stat = 1

const observer = new MutationObserver((mutlist, obs) => {
    if(mutlist[0].attributeName === 'class'){
        if(isBodyStatus('chatbg')){
            stat = 1
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