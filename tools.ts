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