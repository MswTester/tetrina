
const return_form = document.getElementById('return_form');
const play_multi = document.getElementById('play_multi');
const play_solo = document.getElementById('play_solo');
const sig_channel = document.getElementById('sig_channel');
const sig_config = document.getElementById('sig_config');
const sig_about = document.getElementById('sig_about');

document.querySelector('#return_form > h1').textContent = '테트리오에 오신 것을 환영합니다!';
document.querySelector('#return_form > p').textContent = '이 계정은 당신인가요?';
document.querySelector('#return_form #return_logout').textContent = '로그아웃';
document.querySelector('#return_form #return_button').textContent = '참가';
const preform_items = document.querySelectorAll('#return_form > .preform > .preform_item > p');
preform_items[0].textContent = '총 플레이어';
preform_items[1].textContent = '플레이된 게임 수';
preform_items[2].textContent = '플레이된 시간';

document.querySelector('a.pi_play').textContent = '플레이';
document.querySelector('a.pi_ch').textContent = '테트라 채널';
document.querySelector('a.pi_about').textContent = '정보';

play_multi.querySelector('h1').textContent = '멀티플레이';
play_multi.querySelector('p').textContent = '온라인에서 친구와 함께 플레이하세요';
play_solo.querySelector('h1').textContent = '솔로플레이';
play_solo.querySelector('p').textContent = '스스로에 도전하여 랭킹을 올리세요';
sig_channel.querySelector('h1').textContent = '테트라 채널';
sig_channel.querySelector('p').textContent = '랭킹, 리플레이 등을 확인하세요';
sig_config.querySelector('h1').textContent = '설정';
sig_config.querySelector('p').textContent = '여러 테트리오를 설정을 변경하세요';
sig_about.querySelector('h1').textContent = '정보';
sig_about.querySelector('p').textContent = '테트리오에 대한 정보를 확인하세요';

document.getElementById('multi_join').placeholder = '방 코드를 입력하거나 url를 붙여넣으세요. . .';
document.querySelector('#multi_league > h1').textContent = '테트라 리그'
document.querySelector('#multi_league > p').textContent = '당신의 스킬로 상대와 1대1로 겨루세요'
document.querySelector('#multi_quickplay > h1').textContent = '퀵플레이'
document.querySelector('#multi_quickplay > p').textContent = '진행되고 있는 매치에 참여하세요'
document.querySelector('#multi_createroom > h1').textContent = '커스텀 게임'
document.querySelector('#multi_createroom > p').textContent = '당신의 설정대로 공개/비공개 게임을 만들어 플레이하세요'
document.querySelector('#multi_listing > h1').textContent = '게임 참가'
document.querySelector('#multi_listing > p').textContent = '공개 게임에 참가하세요'

document.getElementById('back').textContent = '뒤로';
document.getElementById('list_request_back').textContent = '뒤로';

document.getElementById('multi_createroom').addEventListener('click', () => {
    setTimeout(() => {
        const list_req_scr = document.querySelectorAll('#list_request_scroller > div')
        list_req_scr[0].querySelector('h1').textContent = '공개 방'
        list_req_scr[0].querySelector('p').textContent = '누구나 참여 가능한 방을 만드세요.'
        list_req_scr[1].querySelector('h1').textContent = '비공개 방'
        list_req_scr[1].querySelector('p').textContent = '친구들과 함께하기 위한 비공개 방을 만드세요.'
    }, 100);
})

document.querySelector('#game_40l > h1').textContent = '40줄'
document.querySelector('#game_40l > p').textContent = '40줄을 빠르게 지우세요'
document.querySelector('#game_blitz > h1').textContent = '블리츠'
document.querySelector('#game_blitz > p').textContent = '2분안에 점수를 최대한 내세요'
document.querySelector('#game_zen > h1').textContent = '젠'
document.querySelector('#game_zen > p').textContent = '천천히 연습하세요'
document.querySelector('#game_custom > h1').textContent = '커스텀'
document.querySelector('#game_custom > p').textContent = '자신의 설정대로 플레이하세요'

document.querySelector('#config_account > h1').textContent = '계정'
document.querySelector('#config_account > p').textContent = '계정 설정을 변경하세요'
document.querySelector('p.rc_moreinfo').textContent = '마우스를 올려 더 많은 정보를 확인하세요'

document.querySelector('#config_account_orders > h1').textContent = '주문'
document.querySelector('#config_account_orders > p').textContent = '주문 내역을 확인하세요'

const config_settings = document.querySelectorAll('[data-menuview="config"] > .scroller_block > h1')
config_settings[0].textContent = '조작'
config_settings[1].textContent = '핸들링'
config_settings[2].textContent = '볼륨 & 소리'
config_settings[3].textContent = '게임 플레이'
config_settings[4].textContent = '비디오 & 인터페이스'
config_settings[5].textContent = '알림'
config_settings[6].textContent = '커스텀 배경'