let canvas = document.getElementById("myCanvas");
let ctx = canvas.getContext("2d");
// getContext() method會回傳一個canvas的drawing context>>>CanvasRendering2D
// drawing context可以用來在canvas內畫圖
let unit = 30;
let row = canvas.height / unit; // 320 / 20 = 16
let column = canvas.width / unit; // 320 / 20 = 16

//蛇的初始位置
let snake = []; //array中的每個元素都是一個物件，其功能是儲存身體的 x y 座標 (往右往下越大)
function createSnake() {
  snake[0] = {
    x: 120,
    y: 0,
  };
  snake[1] = {
    x: 90,
    y: 0,
  };
  snake[2] = {
    x: 60,
    y: 0,
  };
  snake[3] = {
    x: 30,
    y: 0,
  };
}

//每個果實都是一個物件，透過 class 製作很多個

class Fruit {
  constructor() {
    this.x = Math.floor(Math.random() * column) * unit;
    this.y = Math.floor(Math.random() * row) * unit;
  }
  //畫果實
  drawFruit() {
    ctx.fillStyle = "yellow";
    ctx.fillRect(this.x, this.y, unit, unit);
  }

  //吃到果實後，果實要更新位置>>>選定一個新的隨機座標，把果實放在那，但不能剛好和蛇的位置重疊
  pickALocation() {
    let overlapping = false;
    let new_x;
    let new_y;

    function checkOverlap(new_x, new_y) {
      for (let i = 0; i < snake.length; i++) {
        if (new_x == snake[i].x && new_y == snake[i].y) {
          overlapping = true;
          return;
        } else {
          overlapping = false;
        }
      }
    }
    //選定新的 x,y
    do {
      new_x = Math.floor(Math.random() * column) * unit;
      new_y = Math.floor(Math.random() * row) * unit;
      checkOverlap(new_x, new_y);
    } while (overlapping); //false 執行一遍，true 繼續執行到變 false

    this.x = new_x;
    this.y = new_y;
  }
}

//初使設定
createSnake();
let myFruit = new Fruit();

//用鍵盤控制蛇的移動

window.addEventListener("keydown", changeDirection);
let direction = "Right";

function changeDirection(event) {
  if (event.key == "ArrowRight" && direction != "Left") {
    direction = "Right";
  } else if (event.key == "ArrowDown" && direction != "Up") {
    direction = "Down";
  } else if (event.key == "ArrowLeft" && direction != "Right") {
    direction = "Left";
  } else if (event.key == "ArrowUp" && direction != "Down") {
    direction = "Up";
  }

  //draw direction="Left",direction="Up",direction="Right"
  //draw  可能在下一次draw之前 方向瞬間從左變右

  //每次按鍵，在下一次畫面被畫之前，不接受任何 keydown 事件，避免連續按鍵導致蛇在邏輯上自殺
  window.removeEventListener("keydown", changeDirection);
}

//成績設定
let highestScore;
loadHighestScore();
let score = 0; //初始分數
document.getElementById("myScore").innerHTML = "遊戲分數：" + score;
document.getElementById("myScore2").innerHTML = "最高分數：" + highestScore;

//畫蛇，蛇身體的每一個部分都儲存在array裡

function draw() {
  //每次畫圖之前，確認蛇有沒有咬到自己，也可以寫在snake.unshift(newHead)之後
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      clearInterval(myGame);
      window.alert("遊戲結束");
      return; //draw()結束
    }
  }

  //讓每一次都是重畫，讓背景變成黑色(預設畫的東西會留著，不斷堆疊)
  ctx.fillStyle = "black"; //背景設成黑色
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //畫果實
  myFruit.drawFruit();

  // 根據 snake 物件的 x,y 劃出蛇
  for (let i = 0; i < snake.length; i++) {
    if (i == 0) {
      ctx.fillStyle = "lightgreen";
    } else {
      ctx.fillStyle = "lightblue"; //填滿的顏色
    }

    //設定穿牆功能>>>放在這邊的原因：取得 snake 每一個元素最新的 x,y 值後，要在確認有沒有穿牆，最終確認後才可以開始畫
    if (snake[i].x >= canvas.width) {
      snake[i].x = 0;
    }
    if (snake[i].x < 0) {
      snake[i].x = canvas.width - unit;
    }
    if (snake[i].y >= canvas.height) {
      snake[i].y = 0;
    }
    if (snake[i].y < 0) {
      snake[i].y = canvas.height - unit;
    }

    //真正劃出蛇
    ctx.strokeStyle = "white"; //外框的顏色
    ctx.fillRect(snake[i].x, snake[i].y, unit, unit); //畫一個實心的長方形 x,y,width,height
    ctx.strokeRect(snake[i].x, snake[i].y, unit, unit); //讓畫好的長方形有外框
  }

  // 以目前的方向(direction變數)來決定蛇的下一個位置要放在哪一個座標
  // snake 物件裡每個元素的 x,y 座標都會在這邊更新
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction == "Left") {
    //snake[0]是物件，但snake[0].x是number
    snakeX -= unit;
  } else if (direction == "Up") {
    snakeY -= unit;
  } else if (direction == "Down") {
    snakeY += unit;
  } else if (direction == "Right") {
    snakeX += unit;
  }

  //新的頭(一個新的物件)，物件的屬性(x,y)就是上面算出來的值>>>它的位置

  let newHead = {
    x: snakeX,
    y: snakeY,
  };
  //確認蛇是否有吃到果實
  if (snake[0].x == myFruit.x && snake[0].y == myFruit.y) {
    //如果是的話，需要重新選定一個隨機位置
    myFruit.pickALocation();
    //劃出新果實// myFruit.drawFruit();上面有寫>>更新果實位置後再畫一次
    //更新分數
    score++;
    setHighestScore(score); //判斷 1.是否須更新localstorage 2.是否更新HighestScore變數的值
    document.getElementById("myScore").innerHTML = "遊戲分數:" + score;
    document.getElementById("myScore2").innerHTML = "最高分數:" + highestScore;
  } else {
    snake.pop(); //刪除陣列最後一項
  }
  //確定好執行按鍵後，新陣列的x,y值會被儲存到全域變數中，作為進行下一次跌代畫圖的依據

  snake.unshift(newHead); //吃到果實往陣列前方加一項、沒吃到要往前一步
  window.addEventListener("keydown", changeDirection);
}

let myGame = window.setInterval(draw, 100); //每0.1秒就畫一次蛇，畫蛇的程式碼貼到 draw 裡面

function loadHighestScore() {
  if (localStorage.getItem("highestScore") == null) {
    highestScore = 0;
  } else {
    highestScore = Number(localStorage.getItem("highestScore"));
  }
}

function setHighestScore(score) {
  if (score > highestScore) {
    localStorage.setItem("highestScore", score);
    highestScore = score;
  }
}
