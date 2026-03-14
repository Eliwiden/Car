import{CreateObj, EndGame,}from './tools.js'
import{ravSvgCar, ravSvgObst, obstacleSize, ravSvgPit}from './game.js'

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

export class CCar extends CScreenObject{
    nDurability=100;
    durabilityCounterDom = CreateObj(120, 50, 60, "DurabilityCounter pos_abs", `HP: ${this.nDurability}`) as HTMLDivElement;
    Move(step: number){
        const rect = this.dom.getBoundingClientRect();//Получаем текущую позицию слева у элемента относительно окна
        const oRect = document.getElementById('field')!.getBoundingClientRect();//Получаем размер и позицию границы поля относительно окна
        if(rect.right + step <= oRect.right && rect.left + step >= oRect.left){
            this.nX += step;//Меняем виртуальное положение
            this.dom.style.left = (this.nX-this.nSize/2) + 'px';//Обновляем позицию DOM элемента по X
        }
    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "CCar", ravSvgCar)});
    }
    updateDurabilityCounter(){
        this.nDurability-=10;
        if(this.durabilityCounterDom){
            this.durabilityCounterDom.innerHTML=`HP${this.nDurability}`;
            if(this.nDurability > 50){
                this.durabilityCounterDom.style.color = "#00FF00";
            }else if (this.nDurability > 20){
                this.durabilityCounterDom.style.color = "#FFFF00";
            }else if (this.nDurability <= 20){
                this.Crash();
            }else{
                this.durabilityCounterDom.style.color = "#FF0000";
            } 
        }
    }

    Crash(){
        this.dom.classList.add("CrashCar");
        EndGame();
    }
}

class CObstacle extends CScreenObject{
    Fall(step: number, car: CCar){

        this.nY += step;
        this.dom.style.top = (this.nY - this.nSize / 2) + 'px';

        if( Math.abs(car.nX-this.nX) <= car.nSize/4 && Math.abs(car.nY-this.nY) <= this.nSize){
            car.Crash();
        }

    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "Obstacle pos_abs", ravSvgObst)});
    }
    setX(x: number){
        this.nX = x;
        this.dom.style.left = (this.nX - this.nSize / 2) + 'px';
    }
}
export const aObstacles: CObstacle[]=[];//Создаём пустой массив монет
export const aObstaclesR: CObstacle[]=[];

export function createObstacle(x: number, bObstacleR?: boolean){
    const y = -obstacleSize;
    const size = obstacleSize;
    
    const obstacle = new CObstacle(x, y, size);
    if(bObstacleR){
        aObstaclesR.push(obstacle);
    }else{
        aObstacles.push(obstacle);
    }
    
}

export class CCoins extends CScreenObject{
    Fall(step: number){
        /*const item = this.dom.getBoundingClientRect();
        const oItem = document.getElementById('field')!.getBoundingClientRect();//Получаем размер и позицию границы поля относительно окна
        if(item.bottom + step <= oItem.bottom && item.left + step >= oItem.left){*/
            this.nY += step //+ 25;//Меняем виртуальное положение
            this.dom.style.top = (this.nY-this.nSize/2) + 'px';//Обновляем позицию DOM элемента по X
        //}
    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "Coin pos_abs", "<br>BTC")});
    }

    IsObjectIn(car: CCar){
        if(Math.abs(car.nX - this.nX) - (this.nSize/2 + car.nSize/2) < 0 && //Коллизия монеты с машиной
            Math.abs(car.nY - this.nY) - (this.nSize/2 + car.nSize/2) < 0){
                return true;
            }else{
                return false
            }
            
        }
        Dissapear(){
            this.dom.remove();
        }
    }

    export class CPit extends CScreenObject{
    Fall(step: number){
        /*const item = this.dom.getBoundingClientRect();
        const oItem = document.getElementById('field')!.getBoundingClientRect();//Получаем размер и позицию границы поля относительно окна
        if(item.bottom + step <= oItem.bottom && item.left + step >= oItem.left){*/
            this.nY += step //+ 25;//Меняем виртуальное положение
            this.dom.style.top = (this.nY-this.nSize/2) + 'px';//Обновляем позицию DOM элемента по X
        //}
    }
    constructor(x: number, y: number, size: number){
        super(x, y, size, ()=>{return CreateObj(x, y, size, "Pit pos_abs", ravSvgPit)});
    }

    IsObjectIn(car: CCar){
        if(Math.abs(car.nX - this.nX) - (this.nSize/2 + car.nSize/2) < 0 && //Коллизия монеты с машиной
            Math.abs(car.nY - this.nY) - (this.nSize/2 + car.nSize/2) < 0){
                return true;
            }else{
                return false
            }
            
        }
        Dissapear(){
            this.dom.remove();
        }
    }

export class CGlobData{
    nRoadGoal=-1;
	score = 0;
	visited = new Set();
}

interface IQuizQuest{
	question: string;
	options: string[];
	correct: number
}

class CQuize{
	quizCompleted = false;
	quizScore = 0;
	currentQuizQuestion = 0;
	quizQuestions:IQuizQuest[] = [
		{
			question: "Cik iedzīvotāju ir Liepājā (aptuveni)?",
			options: ["50 000", "75 000", "100 000", "150 000"],
			correct: 1
		},
		{
			question: "Kā sauc Liepājas galveno pludmali?",
			options: ["Zelta smiltis", "Baltā smiltis", "Sudraba smiltis", "Zilā smiltis"],
			correct: 0
		},
		{
			question: "Kurā gadā Liepāja ieguva pilsētas tiesības?",
			options: ["1263", "1625", "1695", "1800"],
			correct: 1
		},
		{
			question: "Kāds ir Liepājas heraldiskais dzīvnieks?",
			options: ["Lācis", "Vēzis", "Launs", "Jūras zvaigzne"],
			correct: 2
		},
		{
			question: "Cik garš ir Liepājas kanāls?",
			options: ["1,2 km", "2,5 km", "3,8 km", "5 km"],
			correct: 3
		}
	];
}
export const quiz = new CQuize;