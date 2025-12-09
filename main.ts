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
        function CreateCar(x: number, y: number, size: number){//Создаём сегмент змейки
            const dom = document.createElement('div');//Создаём контейнер div
            dom.className = 'CCar';//Присваиваем класс для стилей
            dom.style.top = (y - size/2) + 'px';//Позиция по вертикали
            dom.style.left = (x - size/2) + 'px';//Позиция по горизонтали
            dom.style.height = size + 'px';//Задаём высоту
            dom.style.width = size + 'px';//Задаём ширину
            dom.innerHTML = ravSvg;
            document.body.append(dom);//Добавляем сегмент в тело документа
            return dom;//Возвращаем созданный элемент
        }

        super(x, y, size, CreateCar);
    }
}

class CObstacle extends CScreenObject{
    
}

class CCoins extends CScreenObject{

}

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