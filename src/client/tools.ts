import{oGlobData, idObstacle, idCoins, ROAD_WIDTH, coinCount}from './game.js'
export function CreateObj(x: number, y: number, size: number, sClassName: string, sInnerHTML: string){//Создаём сегмент змейки
    const dom = document.createElement('div');//Создаём контейнер div
    dom.className = sClassName;//Присваиваем класс для стилей
    dom.style.top = (y - size/2) + 'px';//Позиция по вертикали
    dom.style.left = (x - size/2) + 'px';//Позиция по горизонтали
    dom.style.height = size + 'px';//Задаём высоту
    dom.style.width = size + 'px';//Задаём ширину
    dom.innerHTML = sInnerHTML;//Загружаем контейнер аргумент вызов
    document.body.append(dom);//Добавляем сегмент в тело документа
    return dom;//Возвращаем созданный элемент
}
//Math.abs(car.nX-this.nX) <= car.nSize/4 && Math.abs(car.nY-this.nY) <= this.nSize
export function CalcNextX(x: number){
    const OBSTACLE_OFFSET = 15;//10
    if(oGlobData.nRoadGoal < 0 || Math.abs(x-oGlobData.nRoadGoal)<=OBSTACLE_OFFSET){
        oGlobData.nRoadGoal = Math.random()*(document.documentElement.clientWidth-ROAD_WIDTH);       
    }
    const sign = Math.sign(oGlobData.nRoadGoal - x);
    x += OBSTACLE_OFFSET*sign;
    return x;
}

export function EndGame(){
    clearTimeout(idObstacle);
    clearTimeout(idCoins);
    window.onkeydown = null;
	alert(`Game over! Coins collected: ${coinCount}`);
	const urlWithParams = new URL(location.origin + '/levels.html');
    window.open(urlWithParams, '_self');
}

/*
function showScreen(id) {
	document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
	document.getElementById(id).classList.add('active');
	document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

// НОВАЯ ФУНКЦИЯ: закрыть модал и вернуться на title screen
function closeAbout() {
	document.getElementById('aboutModal').style.display = 'none';
	showScreen('titleScreen');
}

function closeAboutAndStart() {
	document.getElementById('aboutModal').style.display = 'none';
	startGame();
}

function startGame() {
	showScreen('locationsScreen');
	renderLocations();
	updateScore();
}

function renderLocations() {
	const list = document.getElementById('locationsList');
	list.innerHTML = '';
	const groups = {};
	
	locations.forEach(loc => {
		if (!groups[loc.group]) groups[loc.group] = [];
		groups[loc.group].push(loc);
	});

	Object.keys(groups).forEach(group => {
		if (group) {
			const header = document.createElement('div');
			header.className = 'group-header';
			header.textContent = group;
			list.appendChild(header);
		}
		groups[group].forEach(loc => {
			const div = document.createElement('div');
			div.className = `location ${visited.has(loc.id) ? 'visited' : ''}`;
			div.innerHTML = `
				${loc.name}
				<div class="external-link">→ ${loc.url}</div>
			`;
			div.onclick = () => visitLocation(loc.id, loc.url, loc.name);
			list.appendChild(div);
		});
	});

	const quizDiv = document.createElement('div');
	quizDiv.className = `location ${quizCompleted ? 'visited game-complete' : ''}`;
	quizDiv.innerHTML = `
		🧠 KVIZ PAR LIEPĀJU (100 punkti!)
		<div class="external-link">${quizCompleted ? '✅ PABEIGTS!' : '5 jautājumi'}</div>
	`;
	quizDiv.onclick = () => startQuiz();
	list.appendChild(quizDiv);
}

function checkGameComplete() {
	const allLocationsVisited = visited.size === locations.length;
	const quizDone = quizCompleted;
	
	if (allLocationsVisited && quizDone) {
		setTimeout(() => {
			document.getElementById('finalScore').innerHTML = `
				<strong>🏆 PERFEKTS Risinājums! 🏆</strong><br>
				<span style="font-size: 1.5em; color: #FF4500;">
					${score} no lokācijām + ${quizScore} no kviza = 
					<strong style="color: #FFD700; font-size: 2em;">${score + quizScore} / 200 PUNKTI!</strong>
				</span><br><br>
				<em>Tu apmeklēji visas 10 vietas Liepājā un pabeidzi kvizu!</em>
			`;
			showScreen('finalScreen');
		}, 1000);
	}
}

function visitLocation(id, url, name) {
	if (visited.has(id)) return;
	
	if (!confirm(`Doties uz ${name}? Jāsakrāj monētas! \n\nAtveras: ${url}\n\nJā/ Nē`)) {
		return;
	}
	
	visited.add(id);
	score += 10;
	updateScore();
	
	const urlWithPath = new URL(location.origin + location.pathname + `/game.html`);
	window.open(urlWithPath+`?id=${id}`);

	//renderLocations();
	//checkGameComplete();
}

function startQuiz() {
	if (quizCompleted) return;
	currentQuizQuestion = 0;
	quizScore = 0;
	showScreen('quizScreen');
	renderQuizQuestion();
}

function renderQuizQuestion() {
	const container = document.getElementById('quizContainer');
	const question = quizQuestions[currentQuizQuestion];
	
	container.innerHTML = `
		<div class="quiz-question">
			<h3>${currentQuizQuestion + 1}. ${question.question}</h3>
			<div class="quiz-options">
				${question.options.map((opt, i) => 
					`<div class="quiz-option" onclick="selectQuizAnswer(${i})">${opt}</div>`
				).join('')}
			</div>
		</div>
	`;
	
	document.getElementById('currentQuizScore').textContent = quizScore;
	document.getElementById('quizProgress').style.width = 
		`${((currentQuizQuestion + 1) / quizQuestions.length) * 100}%`;
}

function selectQuizAnswer(selectedIndex) {
	const question = quizQuestions[currentQuizQuestion];
	const options = document.querySelectorAll('.quiz-option');
	
	options.forEach((opt, i) => {
		opt.style.pointerEvents = 'none';
		if (i === question.correct) {
			opt.classList.add('correct');
		} else if (i === selectedIndex) {
			opt.classList.add('incorrect');
		}
	});

	if (selectedIndex === question.correct) {
		quizScore += 20;
	}

	setTimeout(() => {
		currentQuizQuestion++;
		if (currentQuizQuestion < quizQuestions.length) {
			renderQuizQuestion();
		} else {
			document.getElementById('quizCompleteBtn').style.display = 'inline-block';
			document.getElementById('currentQuizScore').textContent = quizScore;
		}
	}, 1500);
}

function completeQuiz() {
	quizCompleted = true;
	updateScore();
	alert(`Lieliski! Kviz pabeigts!\nKopā no kviza: ${quizScore}/100 punkti`);
	showScreen('locationsScreen');
	renderLocations();
	checkGameComplete();
}

function backToLocations() {
	showScreen('locationsScreen');
	renderLocations();
}

function updateScore() {
	const totalScore = score + (quizCompleted ? quizScore : 0);
	document.getElementById('scoreDisplay').textContent = 
		`Punkti: ${score}/100 no lokācijām + ${quizScore}/100 no kviza = ${totalScore}/200`;
}

function showTitle() {
	showScreen('titleScreen');
}

function restartGame() {
	score = 0;
	visited.clear();
	quizCompleted = false;
	quizScore = 0;
	updateScore();
	showScreen('titleScreen');
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		const modal = document.getElementById('aboutModal');
		if (modal.style.display === 'flex') {
			closeAbout();
		}
	}
	if (e.key === 'Enter' && document.getElementById('aboutModal').style.display === 'flex') {
		closeAboutAndStart();
	}
	if (e.key === 'Enter') startGame();
	if (e.key.toLowerCase() === 'p') showAbout();
});*/
