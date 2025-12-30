class CScreenObject{
    dom:HTMLDivElement;//Часть сегмента змейки визуально
    nX: number;//Текущая координата X
    nY: number;//Текущая координата Y
    nSize: number;//Размер сегмента в пикселях
    constructor(x: number, y: number, size: number, fObjectCreator: Function){
        this.dom = fObjectCreator(x, y, size);//Создаем сегмент по координатам и размеру
        this.nX = x;
        this.nY = y;
        this.nSize = size;
    }

    Dissapear(){
        this.dom.remove();
    }

}

class CCar extends CScreenObject{
    Move(step: number){
        const rect = this.dom.getBoundingClientRect();//Получаем текущую позицию слева у элемента относительно окна
        const oRect = document.getElementById('field')!.getBoundingClientRect();//Получаем размер и позицию границы поля относительно окна
        if(rect.right + step <= oRect.right && rect.left + step >= oRect.left){
            this.nX += step;//Меняем виртуальное положение
            this.dom.style.left = (this.nX-this.nSize/2) + 'px';//Обновляем позицию DOM элемента по X
        }
    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "CCar", ravSvg)});
    }

    Crash(){
        this.dom.classList.add("CrashCar");
        EndGame();
    }
}

class CObstacle extends CScreenObject{
    Fall(step: number, car: CCar) {
        //const item = this.dom.getBoundingClientRect();
        //const fieldRect = document.getElementById('field')!.getBoundingClientRect();

        //if (item.bottom + step <= fieldRect.bottom + 100) {
            this.nY += step;
            this.dom.style.top = (this.nY - this.nSize / 2) + 'px';
        //}

        if( Math.abs(car.nX-this.nX) <= car.nSize/4 && Math.abs(car.nY-this.nY) <= this.nSize){
            car.Crash();
        }

    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "Obstacle", ravSvgObst)});
    }
    setX(x: number){
        this.nX = x;
        this.dom.style.left = (this.nX - this.nSize / 2) + 'px';
    }
}
const aObstacles: CObstacle[]=[];//Создаём пустой массив монет

function createObstacle(x: number){
    const fieldRect = document.getElementById('field')!.getBoundingClientRect();
    const y = -100;
    const size = obstacleSize;
    
    const obstacle = new CObstacle(x, y, size);
    aObstacles.push(obstacle);
}

class CCoins extends CScreenObject{
    Fall(step: number){
        const item = this.dom.getBoundingClientRect();
        const oItem = document.getElementById('field')!.getBoundingClientRect();//Получаем размер и позицию границы поля относительно окна
        if(item.bottom + step <= oItem.bottom && item.left + step >= oItem.left){
            this.nY += step;//Меняем виртуальное положение
            this.dom.style.top = (this.nY-this.nSize/2) + 'px';//Обновляем позицию DOM элемента по X
        }
    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "Coin", "<br>BTC")});
    }
}
