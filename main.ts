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

const ravSvgCar = `<svg width="56" height="100" viewBox="0 0 56 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="3" width="50" height="100" rx="5" fill="black" id="corpe"/>
<rect y="65" width="10" height="30" rx="3" fill="black"/>
<rect x="46" y="10" width="10" height="30" rx="3" fill="black"/>
<rect x="45" y="65" width="10" height="30" rx="3" fill="black"/>
<rect y="10" width="10" height="30" rx="3" fill="black"/>
</svg>`


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