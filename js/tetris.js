import BLOCKS from './blocks.js'

//Dom 선언부
const playground = document.querySelector(".playground > ul")
const gameText = document.querySelector(".game-text")
const scoreDisplay = document.querySelector(".score")
const restartButton = document.querySelector(".game-text > button")

//setting
const GAME_ROWS = 20;
const GAME_COLS = 10;

let score = 0;
let duration = 500;
let downInterval;
// 움직이기 전에 잠시 담아두는 곳
let tempMovingItem;


//다음 블럭의 타입과 좌표의 정보를 가짐
const movingItem = {
    type: "",
    direction: 0,
    top: 0,
    left: 3
};

//실행되면 제일 처음 동작
init()


function init() {


    //spradeOperate {...} -> 안에 내용물만 가져옴!
    tempMovingItem = { ...movingItem };
    for (let i = 0; i < GAME_ROWS; i++) {
        prependNewLine()
    }
    generateNewBlock();
}

function prependNewLine() {


    const li = document.createElement("li");
    const ul = document.createElement("ul");

    for (let j = 0; j < GAME_COLS; j++) {

        const matrix = document.createElement("li");
        ul.prepend(matrix);

    }


    li.prepend(ul)
    playground.prepend(li)


}

function renderBlocks(moveType = "") {
    const { type, direction, top, left } = tempMovingItem
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove(type, "moving");
    })
    BLOCKS[type][direction].some(block => {
        const x = block[0] + left;
        const y = block[1] + top;
        // childenodes는 html에서 배열로 사용할 수 있는 함수
        // childenodes안에 childnodes....


        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);


        if (isAvailable) {
            target.classList.add(type, "moving") //moving클래스도 같이 보내기
        } else {
            tempMovingItem = { ...movingItem } //원래 값으로 복구

            if (moveType === 'retry') {
                clearInterval(downInterval)
                showGameoverText()
            }


            setTimeout(() => {

                console.log("setTimeOut : " + moveType)
                renderBlocks('retry') //재귀함수 호출 -> 에러(call stack) 발생...setTimeout에 넣기
                if (moveType === "top") {
                    seizeBlock();
                }

            }, 0)



            // renderBlocks() //재귀함수 호출 -> 에러 발생...setTimeout에 넣기

            return true; //forEach는 break못하니까 some해주기

        }



    })
    // movingItem 업데이트
    movingItem.left = left;
    movingItem.top = top;
    movingItem.direction = direction;

}

// 블럭이 그라운드를 벗어나는지 확인, 
function checkEmpty(target) {
    if (!target || target.classList.contains("seized")) {
        return false;
    }
    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType)
    console.log("moveBlock : " + moveType)
}


function changeDirection() {
    const direction = tempMovingItem.direction+1<4?tempMovingItem.direction+1:0;
   tempMovingItem.direction=direction;
    renderBlocks()

}
function showGameoverText() {
    gameText.style.display = "flex";
}
//블럭이 쌓이면 움직이지 않도록 초기화!
function seizeBlock() {
    const movingBlocks = document.querySelectorAll(".moving");
    movingBlocks.forEach(moving => {
        moving.classList.remove("moving");
        moving.classList.add("seized");
    })
    checkMatch()
    //generateNewBlock()

}
function checkMatch() {
    const childNodes = playground.childNodes;
    childNodes.forEach(child => {
        let matched = true;
        child.children[0].childNodes.forEach(li => {
            if (!li.classList.contains("seized")) {
                //li에 seized클ㄹ래스를 하나라도 가지고 있지 않다면
                matched = false;

            }
        })
        if (matched) {
            child.remove();
            prependNewLine()
            score++;
            scoreDisplay.innerText = score;
        }

    })
    generateNewBlock()
}

function generateNewBlock() {

    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, duration)

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length)


    movingItem.type = blockArray[randomIndex][0];
    movingItem.top = 0;
    movingItem.left = 0;
    movingItem.direction = 0;
    tempMovingItem = { ...movingItem }
    renderBlocks()
}







function dropBlock() {
    clearInterval(downInterval);
    downInterval = setInterval(() => {
        moveBlock('top', 1)
    }, 15)
}

//event handling
document.addEventListener("keydown", e => {
    switch (e.keyCode) {  
        case 39: //오른쪽 키코드
            moveBlock("left", 1);
            break;
        case 37: //왼쪽 키코드
            moveBlock("left", - 1);
            break;
        case 40: //아래 키코드
            moveBlock("top", 1);
            break;
        case 38:
            changeDirection();
            break;
        case 32: //space bar
            dropBlock();
                 
        default :
            break;
    }

})

restartButton.addEventListener('click', () => {
    playground.innerHTML = "",
        gameText.style.display = "none",
        init();
})
