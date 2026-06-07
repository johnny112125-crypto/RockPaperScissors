const URL = "https://teachablemachine.withgoogle.com/models/djMkwhi3b/";
let model, webcam, maxPredictions;
let isModelLoaded = false;
let currentPrediction = "";

const playBtn = document.getElementById("play-btn");
const labelContainer = document.getElementById("label-container");
const computerMoveEl = document.getElementById("computer-move");
const resultText = document.getElementById("result-text");

const MOVES = {
    ROCK: "Rock",
    PAPER: "Paper",
    SCISSORS: "Scissors"
};

const EMOJIS = {
    "Rock": "✊",
    "Paper": "✋",
    "Scissors": "✌️"
};

// Initialize the image model and setup the webcam
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    try {
        // Load the model and metadata
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(250, 250, flip); // width, height, flip
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // Remove loader and append webcam canvas
        const webcamContainer = document.getElementById("webcam-container");
        document.getElementById("loader").style.display = "none";
        webcamContainer.appendChild(webcam.canvas);

        isModelLoaded = true;
        playBtn.disabled = false;
        playBtn.innerText = "Play Round";
    } catch (error) {
        console.error("Error loading model or webcam:", error);
        labelContainer.innerHTML = "Camera access denied or error loading model.";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    if (!isModelLoaded) return;
    
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    
    // Find the class with the highest probability
    let highestProb = 0;
    let bestClass = "";
    
    for (let i = 0; i < maxPredictions; i++) {
        if (prediction[i].probability > highestProb) {
            highestProb = prediction[i].probability;
            bestClass = prediction[i].className;
        }
    }
    
    // Normalize class names just in case
    if (highestProb > 0.7 && Object.values(MOVES).includes(bestClass)) {
        currentPrediction = bestClass;
        labelContainer.innerHTML = currentPrediction + " " + EMOJIS[currentPrediction];
    } else {
        currentPrediction = "";
        labelContainer.innerHTML = "No clear move...";
    }
}

function generateComputerMove() {
    const movesArray = Object.values(MOVES);
    const randomIndex = Math.floor(Math.random() * movesArray.length);
    return movesArray[randomIndex];
}

function determineWinner(playerMove, compMove) {
    if (playerMove === compMove) return "draw";
    
    if (
        (playerMove === MOVES.ROCK && compMove === MOVES.SCISSORS) ||
        (playerMove === MOVES.PAPER && compMove === MOVES.ROCK) ||
        (playerMove === MOVES.SCISSORS && compMove === MOVES.PAPER)
    ) {
        return "win";
    }
    
    return "lose";
}

function playRound() {
    if (!currentPrediction) {
        resultText.innerText = "Show a move first!";
        resultText.className = "";
        return;
    }

    // Disable button temporarily
    playBtn.disabled = true;
    
    // Animate computer rolling
    let rolls = 0;
    const rollInterval = setInterval(() => {
        const tempMove = generateComputerMove();
        computerMoveEl.innerText = EMOJIS[tempMove];
        computerMoveEl.classList.remove('pop-anim');
        void computerMoveEl.offsetWidth; // trigger reflow
        computerMoveEl.classList.add('pop-anim');
        
        rolls++;
        if (rolls > 10) {
            clearInterval(rollInterval);
            finishRound();
        }
    }, 100);
}

function finishRound() {
    const compMove = generateComputerMove();
    computerMoveEl.innerText = EMOJIS[compMove];
    computerMoveEl.classList.remove('pop-anim');
    void computerMoveEl.offsetWidth;
    computerMoveEl.classList.add('pop-anim');
    
    const result = determineWinner(currentPrediction, compMove);
    
    if (result === "win") {
        resultText.innerText = "You Win! 🎉";
        resultText.className = "win";
    } else if (result === "lose") {
        resultText.innerText = "Computer Wins! 😭";
        resultText.className = "lose";
    } else {
        resultText.innerText = "It's a Draw! 🤝";
        resultText.className = "draw";
    }
    
    playBtn.disabled = false;
}

playBtn.addEventListener("click", playRound);

// Initialize everything on load
window.addEventListener('DOMContentLoaded', init);
