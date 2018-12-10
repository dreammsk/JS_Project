'use strict';


class Vector {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        // не опускайте фигурные скобки и не пишите такие длинные строки
        // так очень сложно понять что делает код
        if (!(vector instanceof Vector)) {
            throw (new Error('Можно прибавлять к вектору только вектор типа Vector'));
        }
        return new Vector(this.x + vector.x, this.y + vector.y);
        
    }

    times(a) {
        return new Vector(this.x * a, this.y * a);
    }

}


class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {

        // см. выше
        if (!(pos instanceof Vector)) {
            throw (new Error('Переданный параметр pos в конструкторе Actor не является вектором'));
        }
        if (!(size instanceof Vector)) {
            throw (new Error('Переданный параметр size в конструкторе Actor не является вектором'));
        }
        if (!(speed instanceof Vector)) {
            throw (new Error('Переданный параметр speed в конструкторе Actor не является вектором'));
        }

        this.pos = pos;
        this.size = size;
        this.speed = speed;

    }

    act() {};

    get type() {
        return 'actor';
    }

    get left() {
        return this.pos.x;
    }
    get top() {
        return this.pos.y;
    }
    get right() {
        return this.pos.x + this.size.x;
    }
    get bottom() {
        return this.pos.y + this.size.y;
    }

    isIntersect(obj) {
        // тут всё должно быть проще
        // если переданный объект выше, ниже, левее или правее данного,
        // то они не пересекаются

        if (!(obj instanceof Actor)) {
            throw (new Error('Переданный параметр obj в конструкторе Actor не является объектом Actor'));
        // проверяем, что объект не пересекается сам с собой
        } else if (obj === this) {
            return false;
        // проверяем, что объект не пересекается с объектом, расположенным в той же точке, но имеющим отрицательный вектор размера
        } else if ((obj.pos.x === this.pos.x) && (obj.pos.y === this.pos.y) && (obj.size.x * this.size.x < 0 || obj.size.y * this.size.y < 0)) {
            return false;   
        // проверяем, что объект полностью содержится в другом, тогда возвращаем true
        } else if (obj.top >= this.top && obj.bottom <= this.bottom && obj.left >= this.left && obj.right <= this.right) {
            return true;   
        } else if (obj.top >= this.bottom || obj.bottom <= this.top || obj.left >= this.right || obj.right <= this.left) {
            return false;
        } else {
            return true;
        }

    }
    
}


class Level {

    constructor(grid=[], actors=[]) {
        this.grid = grid;
        this.actors = actors;
        this.player = this.actors.find(a => a.type === 'player');
        this.height = grid.length;
        this.width = Math.max(0,...grid.map(a => a.length));
        this.status = null;
        this.finishDelay = 1;
    }

    isFinished() {
        // скобки можно убрать
        // лучше использовать === и !==
        return this.status !== 0 && this.finishDelay < 0;
    }

    actorAt(actor) {
        // см. выше
        if (!(actor instanceof Actor)) {
            throw (new Error('Переданный параметр obj в конструкторе Actor не является объектом Actor'));
        }

        return this.actors.find(a => a.isIntersect(actor));   
    }

    obstacleAt(pos, size) {

        // если значение присваивается переменной один раз,
        // то лучше использовать const
        // объект тут создаётся только для того, чтобы сложить несколько чисел,
        // можно обойтись без него
        const actor = new Actor(pos, size);
        let wallIsHit = false;

        if (actor.left < 0) {return 'wall'};
        if (actor.right > this.width) {return 'wall'};
        if (actor.top <0) {return 'wall'};
        if (actor.bottom > this.height) {return 'lava'};

        let leftgrid = Math.floor(actor.left);
        let rightgrid = Math.ceil(actor.right)-1;

        let topgrid = Math.floor(actor.top);
        let bottomgrid = Math.ceil(actor.bottom)-1;

        // тут что-то сложное и я не уверен, что верное
        // алгоритм тут должен быть следующий
        // найти клетки, на которых находится переданный объект
        // обойти их в цикле, если найдено препятствие — вернуть его

        // Я проверяла только контуры объекта, но когда объекты маленькие - ваш вариант однозначно проще и лучше

        for(let x = leftgrid ; x <= rightgrid ; ++x) {
            for(let y = topgrid; y <= bottomgrid; ++y) {

                const obstacle = this.grid[y][x];
                
                if (obstacle === 'lava') {
                    return 'lava';
                } else if (obstacle === 'wall') {
                    wallIsHit = true;
                }
            }
        }

       return wallIsHit ? 'wall' : undefined;

    } 


    removeActor(actor) {
        // поиск в массиве осуществляется 2 раза (includes, indexOf)
        // можно обойтись одник
        const indexOfActor = this.actors.indexOf(actor);
        if (indexOfActor !== -1) {
            this.actors.splice(indexOfActor, 1);
        }
    }

    noMoreActors(type) {
        // есть более подходящий метод у массива,
        // который определяет наличие объекта по услвию
        // и возвращается true/false
        return !(this.actors.some(a => a.type === type));
    }

    playerTouched(type, actor = new Actor) {
        // фигурные скобки
        if (this.status !== null) {
            return;
        }

        if (type === 'lava' || type === 'fireball') {
            this.status = 'lost'
        } else if (type === 'coin') {
            this.removeActor(actor);
            // лучше избегать исппользования тренарного оператора сравнения
            this.status = this.noMoreActors(type) ? 'won' : this.status;
        
        }
    }


}


class LevelParser {
    constructor(dict = {}) {
        this.dict = dict
    }

    actorFromSymbol(symbol) {
        // проверка здесь лишняя
        return this.dict[symbol];
    }


    obstacleFromSymbol(symbol) {
        switch (symbol) {
            case 'x' : return 'wall';
            case '!' : return 'lava';
            // это лишняя строчка, функция и так возвращает undefined,
            // если не указано иное
        }
    }

    createGrid(grid) {
        // здесь можно записать ещё короче, если использовать метод map 2 раза
        return grid.map(a => a.split('').map(b => this.obstacleFromSymbol(b)));
    }

    createActors(grid = []) {
        // если значение присваивается переменной 1 раз, то лучше использовать const
        const arr = [];
        // почему тут var?
        for(let y = 0; y < grid.length; ++y) {
        
            for(let x = 0; x < grid[y].length; ++x) {
                
                // const
                const constr = this.actorFromSymbol(grid[y][x]);
                // по-меому понятнее было бы проверить, что constr это функция,
                // потом создать объект и проверить его через instanceof
                if (Actor.isPrototypeOf(constr) || Actor === constr) {
                    arr.push(new constr(new Vector(x,y)));
                }
            }
        }
        return arr;
    }

    parse(grid) {
        return new Level(this.createGrid(grid), this.createActors(grid));
    }
}


class Fireball extends Actor {
    constructor(pos = new Vector(0, 0), speed = new Vector(0, 0)) {
        super(pos, new Vector(1, 1), speed);
    }

    get type() {
        return 'fireball';
    }

    getNextPosition(time = 1) {
        // здесь нужно использовать меоды класса Vector
        return this.pos.plus(this.speed.times(time));
    }

    handleObstacle() {
        this.speed = this.speed.times(-1);
    }

    act(time, level) {
        let newPosition = this.getNextPosition(time);
        // === undefined можно опустить
        // undefined это пустая ячейка, двигаться можно только если ячейка пустая. 
        if (level.obstacleAt(newPosition, this.size) === undefined) {
            this.pos = newPosition;
        } else {
            this.handleObstacle();
        }
    }
}


class HorizontalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(2, 0));
    }
}

class VerticalFireball extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 2));
    }
}

class FireRain extends Fireball {
    constructor(pos) {
        super(pos, new Vector(0, 3));
        this.startPos = pos;
    }

    handleObstacle() {
        this.pos = this.startPos;
    }
}

class Coin extends Actor {
    constructor(pos = new Vector()) {
        super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
        this.springSpeed = 8;
        this.springDist = 0.07;
        this.spring = Math.random() * 2 * Math.PI;
        this.startPos = this.pos;
    }

    get type() {
        return 'coin';
    }

    updateSpring(time = 1) {
        this.spring = this.spring + this.springSpeed * time;
    }

    getSpringVector() {
        return new Vector(0, Math.sin(this.spring) * this.springDist);
    }

    getNextPosition(time = 1) {
        this.updateSpring(time);
        return this.startPos.plus(this.getSpringVector(time));
    }

    act(time) {
        this.pos = this.getNextPosition(time);
    }
}

class Player extends Actor { 
    constructor(pos = new Vector()){
        super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5));
    }

    get type() {
        return 'player';
    }
};


loadLevels()
   .then(onLoadLevels);

function onLoadLevels(schemas) {

  const actorDict = {
    '@': Player,
    'v': FireRain,
    '=': HorizontalFireball,
    'o': Coin,
    '|': VerticalFireball
  }
  
  const parser = new LevelParser(actorDict);

  runGame(JSON.parse(schemas), parser, DOMDisplay)
    .then(() => alert('Вы выиграли приз!'));

}





