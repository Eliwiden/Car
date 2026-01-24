const ravSvg = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="black" stroke="grey" stroke-width="2" />
                </svg>`

const ravSvgObst = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="orange" stroke="yellow" stroke-width="2" />
                </svg>`

//const x = Math.random()*(document.documentElement.clientWidth - 200)+100;
//const y = Math.random()*(document.documentElement.clientHeight - 200)+100;
const obstacleSize = 20;
const speed = 30;
let bObstacleEnough = false;
let nGlobX = 100;
const ROAD_WIDTH = 500;
const COIN_SIZE = 50;
let coinCount = 0;

let idObstacle = setInterval(()=>{
    const fieldRect = document.body.getBoundingClientRect();

    if(!bObstacleEnough){
        createObstacle(nGlobX);
        createObstacle(nGlobX + ROAD_WIDTH, true);
        nGlobX = CalcNextX(nGlobX);
    }

    for(let i = aObstacles.length - 1; i >= 0; i--){
        const obstacle = aObstacles[i];
        obstacle.Fall(speed, car);
        const obstacleR = aObstaclesR[i];
        obstacleR.Fall(speed, car);

        if(obstacle.nY > fieldRect.bottom){
            bObstacleEnough = true;
            obstacle.Fall(-fieldRect.height-obstacleSize, car);
            obstacleR.Fall(-fieldRect.height-obstacleSize, car);
            obstacle.setX(nGlobX);
            obstacleR.setX(nGlobX + ROAD_WIDTH);
            nGlobX = CalcNextX(nGlobX);
        }
    }

    for(let i = aCoins.length - 1; i >= 0; i--){
        aCoins[i].Fall(speed);
    }

}, 100)

const aCoins: CCoins[]=[];//Создаём пустой массив монет

let idCoins = setInterval(()=>{
    //Генерим случайную координату для еды
        const x = Math.random()*(ROAD_WIDTH-COIN_SIZE)+nGlobX+COIN_SIZE/2;
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
            coin.Dissapear();
            aCoins.splice(i, 1);
        }
    }
}, 100);


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