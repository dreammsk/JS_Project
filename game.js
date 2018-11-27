'use strict';


console.log('Hello')

class Vector {

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    plus(vector) {
        if (!(vector instanceof Vector)) throw (new Error('Можно прибавлять к вектору только вектор типа Vector'));
        return new Vector(this.x + vector.x, this.y + vector.y);
        
    }

    times(a) {
        return new Vector(this.x * a, this.y * a);
    }

}


class Actor {
    constructor(pos = new Vector(), size = new Vector(1, 1), speed = new Vector()) {

        if (!(pos instanceof Vector)) throw (new Error('Переданный параметр pos в конструкторе Actor не является вектором'));
        if (!(size instanceof Vector)) throw (new Error('Переданный параметр size в конструкторе Actor не является вектором'));
        if (!(speed instanceof Vector)) throw (new Error('Переданный параметр speed в конструкторе Actor не является вектором'));

        this.pos = pos;
        this.size = size;
        this.speed = speed;

        Object.defineProperty(this, 'type', {
            value: 'actor'
        });

    }
    act() {};

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
        if (!(obj instanceof Actor)) throw (new Error('Переданный параметр obj в конструкторе Actor не является объектом Actor'));
        
        const checkObjTop = obj.top >= this.top && obj.top < this.bottom;
        const checkObjBottom = obj.bottom > this.top && obj.bottom <= this.bottom;
        const checkObjRight = obj.right > this.left && obj.right <= this.right;
        const checkObjLeft = obj.left >= this.left && obj.left < this.right;

        const checkPos = (obj.pos.x === this.pos.x) && (obj.pos.y === this.pos.y);
        const checkSize = (obj.size.x * this.size.x < 0 || obj.size.y * this.size.y);
        

        if (obj === this) {return false}
        else if (checkPos && checkSize) {return false}
        else if (checkObjTop && checkObjLeft) {return true}
        else if (checkObjTop && checkObjRight) {return true}
        else if (checkObjBottom && checkObjLeft) {return true}
        else if (checkObjBottom && checkObjRight) {return true}
        
        else {return false}

    }
    
}

const position = new Vector(30, 50);
const size = new Vector(5, 5);

const player = new Actor(position, size);
const moveX = new Vector(1, 0);
const moveY = new Vector(0, 1);
const coins = [
  new Actor(position.plus(moveX.times(-1))),
  new Actor(position.plus(moveY.times(-1))),
  new Actor(position.plus(size).plus(moveX)),
  new Actor(position.plus(size).plus(moveY))
];
coins.forEach(coin => {
  const notIntersected = player.isIntersect(coin);
  console.log(notIntersected);
  //console.log(notIntersected);
  console.log('player',player.left,player.right,player.top,player.bottom);
  console.log('coin',coin.left,coin.right,coin.top,coin.bottom);
});