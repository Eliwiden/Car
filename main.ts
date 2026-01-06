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
let x = 100;
let x2 = x + 300;
let idObstacle = setInterval(()=>{
    const fieldRect = document.body.getBoundingClientRect();
    if(!bObstacleEnough){
        createObstacle(x);
        createObstacle(x2);
        x = CalcNextX(x, fieldRect.right);
        x2 = CalcNextX(x2, fieldRect.right);
    }

    for(let i = aObstacles.length - 1; i >= 0; i--){
        const obstacle = aObstacles[i];
        obstacle.Fall(speed, car);
        
        if(obstacle.nY > fieldRect.bottom){
            bObstacleEnough = true;
            obstacle.Fall(-fieldRect.height-150, car);
            if(Math.abs(obstacle.nX - x) < Math.abs(obstacle.nX - x2)){
                obstacle.setX(x);
                x = CalcNextX(x, fieldRect.right);
            }else{
                obstacle.setX(x2);
                x2 = CalcNextX(x2, fieldRect.right);
            }
        }
    }

}, 100)

const aCoins: CCoins[]=[];//Создаём пустой массив монет

let idCoins = setInterval(()=>{
    //Генерим случайную координату для еды
        const x = Math.random()*(document.documentElement.clientWidth - 200)+ 100;
        const y = Math.random()*(document.documentElement.clientHeight - 200)+ 100;
        aCoins.push(new CCoins(x, y, 50));
    if(aCoins.length > 5){
        aCoins[0].Dissapear();
        aCoins.splice(0,1);
    }
}, 1000)

window.onkeydown=(e:KeyboardEvent) =>{
    e.preventDefault()
    switch(e.code){
        case "ArrowLeft": car.Move(-5);
        break;
        case "ArrowRight": car.Move(5);
        break;
    }
}

const car = new CCar(document.documentElement.clientWidth/2, document.documentElement.clientHeight/2, 100);