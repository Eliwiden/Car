const ravSvg = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="black" stroke="grey" stroke-width="2" />
                </svg>`

const ravSvgObst = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="orange" stroke="yellow" stroke-width="2" />
                </svg>`

const ravSvgPit = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="grey" stroke="black" stroke-width="2" />
                </svg>`

/*
const ravSvgCar = `<svg width="56" height="100" viewBox="0 0 56 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" width="50" height="100" rx="5" fill="black" id="corpe"/>
                        <rect y="65" width="10" height="30" rx="3" fill="black"/>
                        <rect x="46" y="10" width="10" height="30" rx="3" fill="black"/>
                        <rect x="45" y="65" width="10" height="30" rx="3" fill="black"/>
                        <rect y="10" width="10" height="30" rx="3" fill="black"/>
                    </svg>`*/

/*Google version
const ravSvgCar = `<svg width="100" height="100" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
                        <!-- Car Body -->
                        <rect x="20" y="20" width="60" height="110" rx="10" fill="#333" id="corpe"/>
                        <!-- Windshield -->
                        <rect x="25" y="35" width="50" height="20" rx="2" fill="#888" />
                        <!-- Rear Window -->
                        <rect x="25" y="90" width="50" height="15" rx="2" fill="#888" />
                        <!-- Roof/Top -->
                        <rect x="30" y="55" width="40" height="35" rx="5" fill="#555" />
                    </svg>`*/

const ravSvgCar = `<svg width="56" height="101" viewBox="0 0 56 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6.1" y="0.1" width="6.8" height="6.8" rx="3.4" fill="#FCFF34"/>
                        <rect x="6.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="6.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="6.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="6.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="41.1" y="0.1" width="6.8" height="6.8" rx="3.4" fill="#FCFF34"/>
                        <rect x="41.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="41.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="41.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="41.1" y="0.1" width="6.8" height="6.8" rx="3.4" stroke="black" stroke-width="0.2"/>
                        <rect x="0.5" y="66.5" width="9" height="29" rx="2.5" fill="#7B7676" stroke="black"/>
                        <rect x="46.5" y="11.5" width="9" height="29" rx="2.5" fill="#7B7676" stroke="black"/>
                        <rect x="46.5" y="66.5" width="9" height="29" rx="2.5" fill="#7B7676" stroke="black"/>
                        <rect x="0.5" y="11.5" width="9" height="29" rx="2.5" fill="#7B7676" stroke="black"/>
                        <rect x="3.5" y="1.5" width="49" height="99" rx="4.5" fill="#21187D" stroke="#E7E3E3" id="corpe"/>
                        <ellipse cx="27.5" cy="50.5" rx="4.5" ry="43.5" fill="white"/>
                        <rect x="11" y="21" width="34" height="11" rx="5.5" fill="black"/>
                        <rect x="45" y="38" width="4" height="30" fill="black"/>
                        <rect x="12.25" y="96.25" width="29.5" height="4.5" fill="black" stroke="#FF0000" stroke-width="0.5"/>
                        <rect x="8" y="38" width="4" height="30" fill="black"/>
                    </svg>`

//100 on 150 is also a good width to heigth
//const x = Math.random()*(document.documentElement.clientWidth - 200)+100;
//const y = Math.random()*(document.documentElement.clientHeight - 200)+100;
const obstacleSize = 20;
const speed = 30;//easy: 30 medium: 50
let bObstacleEnough = false;
let nGlobX = 100;
const ROAD_WIDTH = 500;//easy: 500 medium: 300
const COIN_SIZE = 50;
let coinCount = 0;
let coinCounterDom: HTMLDivElement;

function createCoinCounter(){
    coinCounterDom = CreateObj(50, 50, 60, "CoinCounter", `BTC<br>${coinCount}`);
    //return coinCounterDom;
}

function updateCoinCounter(){
    if (coinCounterDom){
        coinCounterDom.innerHTML = `BTC<br>${coinCount}`;
    }
}

createCoinCounter();

//const coinCounterDom = createCoinCounter();

let idObstacle = setInterval(()=>{
    const fieldRect = document.body.getBoundingClientRect();

    if(!bObstacleEnough){
        createObstacle(nGlobX);
        createObstacle(nGlobX + ROAD_WIDTH, true);
        nGlobX = CalcNextX(nGlobX);
    }
    if(oPit){
        oPit.Fall(speed);
    }
    for(let i = aObstacles.length - 1; i >= 0; i--){
        const obstacle = aObstacles[i];
        obstacle.Fall(speed, car);
        const obstacleR = aObstaclesR[i];
        obstacleR.Fall(speed, car);

        if(obstacle.nY > fieldRect.bottom){
            bObstacleEnough = true;
            obstacle.Fall(-fieldRect.height-obstacleSize*2, car);
            obstacleR.Fall(-fieldRect.height-obstacleSize*2, car);
            obstacle.setX(nGlobX);
            obstacleR.setX(nGlobX + ROAD_WIDTH);
            nGlobX = CalcNextX(nGlobX);
        }
    }

    for(let i = aCoins.length - 1; i >= 0; i--){
        aCoins[i].Fall(speed);
    }

}, 80)

createCoinCounter();

const aCoins: CCoins[]=[];//Создаём пустой массив монет

let idCoins = setInterval(()=>{
    //Генерим случайную координату для еды
        const x = Math.random()*(ROAD_WIDTH-COIN_SIZE*2)+nGlobX+COIN_SIZE;//2
        const y = COIN_SIZE/2;
        aCoins.push(new CCoins(x, y, COIN_SIZE));
    if(aCoins.length > 5){
        aCoins[0].Dissapear();
        aCoins.splice(0,1);
    }
}, 1000)

setInterval(()=>{
    const fieldRect = document.body.getBoundingClientRect();
    for(let i = aCoins.length - 1; i >= 0; i--){
        const coin = aCoins[i];
        if(coin.IsObjectIn(car)){
            coinCount++;
            coin.Dissapear();
            aCoins.splice(i, 1);
            updateCoinCounter();
        }
    }
}, 100);

let oPit: CPit | null = null;
let nDelayPit = 10;
setTimeout(()=>{
    if(oPit){
        oPit.Dissapear();
    }
    const x = Math.random()*(ROAD_WIDTH-COIN_SIZE*2)+nGlobX+COIN_SIZE;//2
    const y = COIN_SIZE/2;
    oPit = new CPit(x,y,COIN_SIZE);
    nDelayPit = Math.random()*(17)+3;
}, nDelayPit*1000);

window.onkeydown=(e:KeyboardEvent) =>{
    e.preventDefault()
    switch(e.code){
        case "ArrowLeft": car.Move(-5);
        break;
        case "ArrowRight": car.Move(5);
        break;
    }
}

const car = new CCar((nGlobX+ROAD_WIDTH)/2, document.documentElement.clientHeight*0.9, 100);
const oGlobData = new CGlobData();