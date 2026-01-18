function CreateObj(x: number, y: number, size: number, sClassName: string, sInnerHTML: string){//Создаём сегмент змейки
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
function CalcNextX(x: number){
    const OBSTACLE_OFFSET = 10;
    if(oGlobData.nRoadGoal < 0 || Math.abs(x-oGlobData.nRoadGoal)<=OBSTACLE_OFFSET){
        oGlobData.nRoadGoal = Math.random()*(document.documentElement.clientWidth-ROAD_WIDTH);       
    }
    const sign = Math.sign(oGlobData.nRoadGoal - x);
    x += OBSTACLE_OFFSET*sign;
    return x;
}

function EndGame(){
    clearTimeout(idObstacle);
    clearTimeout(idCoins);
    window.onkeydown = null;
}