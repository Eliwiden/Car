// Async/await version (already async - rewritten for clarity)
export async function postData(sCommand: string, data: any): Promise<{
  success: boolean;
  received: any;
  timestamp: string;
}> {
  try {
    const response = await fetch('/api/'+sCommand, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Post failed:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
    console.log('index.html loaded');
    const domBtnAbout = document.getElementById("showAbout");
	if(domBtnAbout){
		domBtnAbout.onclick = async () => {
			document.getElementById('aboutModal')!.style.display = 'flex';
            try{
                const aFileList = await postData('fileList', 'Headlights');
                alert(aFileList);
            }catch(error){
                alert(error)
            }
		}
	}
	const domCloseAbout = document.getElementById("closeAbout");
	if(domCloseAbout){
		domCloseAbout.onclick = () => {
			document.getElementById('aboutModal')!.style.display = 'none';
		}
	}
    const domCloseAboutAndStart = document.getElementById("closeAboutAndStart");
    if (domCloseAboutAndStart) {
        domCloseAboutAndStart.onclick = () => {
            document.getElementById('aboutModal')!.style.display = 'none';
            const urlWithParams = new URL(location.origin + location.pathname + 'game.html');
            urlWithParams.searchParams.set('level', "1");
            window.open(urlWithParams, '_self');
        };
    }
    const domStartGame = document.getElementById("startGame");
    if (domStartGame) {
        domStartGame.onclick = () => {
            const urlWithParams = new URL(location.origin + location.pathname + 'levels.html');
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