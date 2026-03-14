import {locations, } from "./common.js"

document.addEventListener('DOMContentLoaded', async function () {
    console.log('index.html loaded');
	const domBtnAbout = document.getElementById("showAbout");
	if(domBtnAbout){
		domBtnAbout.onclick = () => {
			document.getElementById('aboutModal')!.style.display = 'flex';
		}
	}
	const domCloseAbout = document.getElementById("closeAbout");
	if(domCloseAbout){
		domCloseAbout.onclick = () => {
			document.getElementById('aboutModal')!.style.display = 'none';
		}
	}
    const domLevelsContainer = document.getElementById("showTitle");
    if(domLevelsContainer){
        locations.forEach(it => {
            const btn = document.createElement('button');
            btn.innerHTML = it.name;
			btn.onclick = () => {
				const urlWithParams = new URL(location.origin + '/game.html');
				urlWithParams.searchParams.set('level', it.id);
				window.open(urlWithParams, '_self');
			}
			domLevelsContainer.append(btn);
        });
    }
    const domStartGame = document.getElementById("startGame");
    if (domStartGame) {
        domStartGame.onclick = () => {
            const urlWithParams = new URL(location.origin + location.pathname + 'game.html');
            urlWithParams.searchParams.set('level', "0");
            window.open(urlWithParams, '_self');
        };
    }
});
/*
// НОВАЯ ФУНКЦИЯ: закрыть модал и вернуться на title screen
function CloseAbout() {
    document.getElementById('aboutModal').style.display = 'none';
    showScreen('titleScreen');
}

function closeAboutAndStart() {
    document.getElementById('aboutModal').style.display = 'none';
    startGame();
}

*/