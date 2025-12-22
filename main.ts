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

const ravSvg = `<svg viewBox="0 0 100 100">
                    <rect x="25" y="0" width="50" height="100" rx="10" ry="10" 
                        fill="black" stroke="grey" stroke-width="2" />
                </svg>`

//const x = Math.random()*(document.documentElement.clientWidth - 200)+100;
//const y = Math.random()*(document.documentElement.clientHeight - 200)+100;

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
}

class CObstacle extends CScreenObject{
    Fall(step: number) {
        const item = this.dom.getBoundingClientRect();
        const fieldRect = document.getElementById('field')!.getBoundingClientRect();

        if (item.bottom + step <= fieldRect.bottom + 100) {
            this.nY += step;
            this.dom.style.top = (this.nY - this.nSize / 2) + 'px';
        }

    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "OBSTACLE", "ravSvg")});
    }
}
const aObstacles: CObstacle[]=[];//Создаём пустой массив монет

function createObstacle(){
    const fieldRect = document.getElementById('field')!.getBoundingClientRect();
    const x = Math.random() * (fieldRect.right - fieldRect.left - 100) + fieldRect.left + 50;
    const y = -100;
    const size = 50;
    
    const obstacle = new CObstacle(x, y, size);
    //aObstacles.push(new CObstacle);
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

const aCoins: CCoins[]=[];//Создаём пустой массив монет

setInterval(()=>{
    //Генерим случайную координату для еды
        const x = Math.random()*(document.documentElement.clientWidth - 200)+ 100;
        const y = Math.random()*(document.documentElement.clientHeight - 200)+ 100;
        aCoins.push(new CCoins(x, y, 50));
    if(aCoins.length > 5){
        aCoins[0].Dissapear();
        aCoins.splice(0,1);
    }
}, 1000)

window.addEventListener("keydown",(e:KeyboardEvent) =>{
    e.preventDefault()
    switch(e.code){
        case "ArrowLeft": car.Move(-5);
        break;
        case "ArrowRight": car.Move(5);
        break;
    }
})

const car = new CCar(document.documentElement.clientWidth/2, document.documentElement.clientHeight/2, 100);