// ===== GAME STATE =====
const gameState = {
    partnerA: {
        name: "Partner A",
        scenarios: [
            { id: 1, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 },
            { id: 2, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 },
            { id: 3, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 }
        ]
    },
    partnerB: {
        name: "Partner B",
        scenarios: [
            { id: 1, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 },
            { id: 2, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 },
            { id: 3, text: "", trueIntent: "", partnerGuess: "", accuracyRating: 0, confidenceRating: 0 }
        ]
    },
    currentPhase: "landing",
    firstPlayer: "A", // Who wrote scenarios first
    currentPlayer: null, // Current active player
    currentScenarioIndex: 0,
    guessingPhase: {
        guesser: null,
        writer: null,
        scenarioIndex: 0
    },
    revealPhase: {
        writer: null,
        guesser: null,
        scenarioIndex: 0,
        isPartnerAComplete: false
    },
    attunementScore: 0,
    maxScore: 30
};

// ===== UTILITY FUNCTIONS =====
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
}

function getPartner(partnerLetter) {
    return partnerLetter === 'A' ? gameState.partnerA : gameState.partnerB;
}

function getOtherPartner(partnerLetter) {
    return partnerLetter === 'A' ? gameState.partnerB : gameState.partnerA;
}

function getPartnerLetter(partner) {
    return partner === gameState.partnerA ? 'A' : 'B';
}

// ===== PAGE 1: LANDING =====
function startGame() {
    gameState.currentPhase = "setup";
    showPage('setup-page');
}

// ===== PAGE 2: SETUP =====
function setupComplete() {
    // Get who goes first
    const firstPlayerRadio = document.querySelector('input[name="first-player"]:checked');
    gameState.firstPlayer = firstPlayerRadio.value;
    gameState.currentPlayer = gameState.firstPlayer;

    // Move to scenario input
    gameState.currentPhase = "scenario-input";
    setupScenarioInputPage();
    showPage('scenario-input-page');
}

// ===== PAGE 3: SCENARIO INPUT =====
function setupScenarioInputPage() {
    const partner = gameState.currentPlayer;
    const title = document.getElementById('scenario-input-title');
    const submitBtn = document.getElementById('scenario-submit-btn');

    // Clear inputs
    document.getElementById('scenario-1').value = '';
    document.getElementById('scenario-2').value = '';
    document.getElementById('scenario-3').value = '';

    if (partner === 'A') {
        title.textContent = "Partner A: Write 3 everyday moments";
        submitBtn.textContent = "Done — pass to Partner B";
    } else {
        title.textContent = "Partner B: Write 3 everyday moments";
        submitBtn.textContent = "Done — continue";
    }
}

function submitScenarios() {
    const scenario1 = document.getElementById('scenario-1').value.trim();
    const scenario2 = document.getElementById('scenario-2').value.trim();
    const scenario3 = document.getElementById('scenario-3').value.trim();

    // Validation
    if (!scenario1 || !scenario2 || !scenario3) {
        alert('Please fill in all 3 scenarios before continuing.');
        return;
    }

    // Store scenarios
    const partner = getPartner(gameState.currentPlayer);
    partner.scenarios[0].text = scenario1;
    partner.scenarios[1].text = scenario2;
    partner.scenarios[2].text = scenario3;

    // Determine next step
    if (gameState.currentPlayer === gameState.firstPlayer) {
        // First partner done, switch to other partner
        gameState.currentPlayer = gameState.firstPlayer === 'A' ? 'B' : 'A';
        setupHandoffPage('scenario-input');
        showPage('handoff-page');
    } else {
        // Both partners done, move to guessing phase
        startGuessingPhase();
    }
}

// ===== PAGE 4: HANDOFF =====
function setupHandoffPage(nextPhase) {
    const title = document.getElementById('handoff-title');
    const instruction = document.getElementById('handoff-instruction');
    const currentPartner = gameState.currentPlayer;
    const previousPartner = currentPartner === 'A' ? 'B' : 'A';

    if (nextPhase === 'scenario-input') {
        title.textContent = `Pass the device to Partner ${currentPartner}`;
        instruction.textContent = `Partner ${previousPartner}, look away! Partner ${currentPartner}, tap below when ready.`;
    } else if (nextPhase === 'guessing') {
        const guesser = gameState.guessingPhase.guesser;
        title.textContent = `Pass the device to Partner ${guesser}`;
        instruction.textContent = `Partner ${previousPartner}, look away! Partner ${guesser}, tap below when ready.`;
    }
}

function handoffComplete() {
    // Determine where to go next based on current context
    if (gameState.currentPhase === 'scenario-input') {
        setupScenarioInputPage();
        showPage('scenario-input-page');
    } else if (gameState.currentPhase === 'guessing') {
        setupGuessingPage();
        showPage('guessing-page');
    }
}

// ===== PAGE 5: GUESSING PHASE =====
function startGuessingPhase() {
    gameState.currentPhase = "guessing";

    // Partner A guesses Partner B's scenarios first
    gameState.guessingPhase.guesser = 'A';
    gameState.guessingPhase.writer = 'B';
    gameState.guessingPhase.scenarioIndex = 0;

    setupHandoffPage('guessing');
    showPage('handoff-page');
}

function setupGuessingPage() {
    const guesser = gameState.guessingPhase.guesser;
    const writer = gameState.guessingPhase.writer;
    const scenarioIndex = gameState.guessingPhase.scenarioIndex;
    const writerPartner = getPartner(writer);
    const scenario = writerPartner.scenarios[scenarioIndex];

    // Update title
    const title = document.getElementById('guessing-title');
    title.textContent = `Partner ${guesser}: What do you think Partner ${writer}'s intention is?`;

    // Display scenario
    document.getElementById('guess-scenario-text').textContent = scenario.text;

    // Clear guess input
    document.getElementById('guess-input').value = '';

    // Update progress
    document.getElementById('guess-progress').textContent = `Scenario ${scenarioIndex + 1} of 3`;

    // Update button text
    const btn = document.querySelector('#guessing-page .btn-primary');
    if (scenarioIndex < 2) {
        btn.textContent = 'Next scenario';
    } else {
        btn.textContent = 'Continue';
    }
}

function submitGuess() {
    const guess = document.getElementById('guess-input').value.trim();

    if (!guess) {
        alert('Please enter your guess before continuing.');
        return;
    }

    // Store guess
    const writer = gameState.guessingPhase.writer;
    const scenarioIndex = gameState.guessingPhase.scenarioIndex;
    const writerPartner = getPartner(writer);
    writerPartner.scenarios[scenarioIndex].partnerGuess = guess;

    // Move to next scenario or phase
    if (gameState.guessingPhase.scenarioIndex < 2) {
        // More scenarios for this writer
        gameState.guessingPhase.scenarioIndex++;
        setupGuessingPage();
    } else {
        // Check if we need to switch guesser/writer
        if (gameState.guessingPhase.guesser === 'A') {
            // Switch: B guesses A's scenarios
            gameState.guessingPhase.guesser = 'B';
            gameState.guessingPhase.writer = 'A';
            gameState.guessingPhase.scenarioIndex = 0;
            gameState.currentPlayer = 'A'; // For handoff
            setupHandoffPage('guessing');
            showPage('handoff-page');
        } else {
            // All guessing done, move to reveal phase
            startRevealPhase();
        }
    }
}

// ===== PAGE 6: REVEAL & RATING PHASE =====
function startRevealPhase() {
    gameState.currentPhase = "reveal";

    // Start with Partner A's scenarios
    gameState.revealPhase.writer = 'A';
    gameState.revealPhase.guesser = 'B';
    gameState.revealPhase.scenarioIndex = 0;
    gameState.revealPhase.isPartnerAComplete = false;

    setupRevealPage();
    showPage('reveal-page');
}

function setupRevealPage() {
    const writer = gameState.revealPhase.writer;
    const guesser = gameState.revealPhase.guesser;
    const scenarioIndex = gameState.revealPhase.scenarioIndex;
    const writerPartner = getPartner(writer);
    const scenario = writerPartner.scenarios[scenarioIndex];

    // Display scenario
    document.getElementById('reveal-scenario').textContent = scenario.text;

    // Display guess
    document.getElementById('reveal-guesser-label').textContent = `Partner ${guesser}'s guess`;
    document.getElementById('reveal-guess').textContent = scenario.partnerGuess;

    // True intent input
    document.getElementById('reveal-writer-label').textContent = `Partner ${writer}'s true intention`;
    document.getElementById('true-intent-input').value = scenario.trueIntent || '';

    // Update slider labels
    document.getElementById('accuracy-label').textContent = `Partner ${writer}: How close was their guess?`;
    document.getElementById('confidence-label').textContent = `Partner ${guesser}: How confident were you in your guess?`;

    // Reset sliders
    document.getElementById('accuracy-slider').value = 3;
    document.getElementById('confidence-slider').value = 3;
    document.getElementById('accuracy-value').textContent = '3';
    document.getElementById('confidence-value').textContent = '3';

    // Clear reflection
    document.getElementById('reflection-input').value = '';

    // Calculate total scenario count
    const totalScenarios = gameState.revealPhase.isPartnerAComplete ?
        (scenarioIndex + 4) : (scenarioIndex + 1);
    document.getElementById('reveal-progress').textContent = `Scenario ${totalScenarios} of 6`;

    // Update button text
    const btn = document.querySelector('#reveal-page .btn-primary');
    if (totalScenarios < 6) {
        btn.textContent = 'Next';
    } else {
        btn.textContent = 'See results';
    }
}

function submitReveal() {
    const trueIntent = document.getElementById('true-intent-input').value.trim();

    if (!trueIntent) {
        alert('Please enter the true intention before continuing.');
        return;
    }

    // Store data
    const writer = gameState.revealPhase.writer;
    const scenarioIndex = gameState.revealPhase.scenarioIndex;
    const writerPartner = getPartner(writer);
    const scenario = writerPartner.scenarios[scenarioIndex];

    scenario.trueIntent = trueIntent;
    scenario.accuracyRating = parseInt(document.getElementById('accuracy-slider').value);
    scenario.confidenceRating = parseInt(document.getElementById('confidence-slider').value);

    // Move to next scenario or phase
    if (gameState.revealPhase.scenarioIndex < 2) {
        // More scenarios for this writer
        gameState.revealPhase.scenarioIndex++;
        setupRevealPage();
    } else {
        // Check if we need to switch to other partner's scenarios
        if (!gameState.revealPhase.isPartnerAComplete) {
            // Switch to Partner B's scenarios
            gameState.revealPhase.writer = 'B';
            gameState.revealPhase.guesser = 'A';
            gameState.revealPhase.scenarioIndex = 0;
            gameState.revealPhase.isPartnerAComplete = true;
            setupRevealPage();
        } else {
            // All reveals done, show results
            showResults();
        }
    }
}

// ===== PAGE 7: RESULTS =====
function showResults() {
    gameState.currentPhase = "results";

    // Calculate attunement score (sum of all accuracy ratings)
    let totalAccuracy = 0;
    gameState.partnerA.scenarios.forEach(s => totalAccuracy += s.accuracyRating);
    gameState.partnerB.scenarios.forEach(s => totalAccuracy += s.accuracyRating);
    gameState.attunementScore = totalAccuracy;

    // Display score
    document.getElementById('attunement-score').textContent = `${gameState.attunementScore} out of ${gameState.maxScore}`;

    // Update interpretation based on score
    const interpretation = document.querySelector('.score-interpretation');
    const percentage = (gameState.attunementScore / gameState.maxScore) * 100;

    if (percentage >= 80) {
        interpretation.textContent = "You're deeply attuned to each other's inner world. Beautiful alignment.";
    } else if (percentage >= 60) {
        interpretation.textContent = "You're tuned into each other in some areas, and discovering new layers in others.";
    } else if (percentage >= 40) {
        interpretation.textContent = "There's room to explore each other's perspectives more deeply. Curiosity is your friend.";
    } else {
        interpretation.textContent = "You're at the beginning of understanding each other's inner experiences. What a journey ahead.";
    }

    // Animate circle overlap based on score percentage
    animateCircleOverlap(percentage);

    showPage('results-page');
}

function animateCircleOverlap(percentage) {
    // Adjust circle positions based on alignment percentage
    const circleA = document.querySelector('.circle-a');
    const circleB = document.querySelector('.circle-b');

    // Higher percentage = more overlap
    // At 0%: no overlap (80px apart)
    // At 100%: maximum overlap (40px apart)
    const maxSeparation = 80;
    const minSeparation = 40;
    const separation = maxSeparation - ((percentage / 100) * (maxSeparation - minSeparation));

    circleA.style.left = '0px';
    circleB.style.left = `${separation}px`;
}

function resetGame() {
    // Clear all game state
    gameState.partnerA.scenarios.forEach(s => {
        s.text = '';
        s.trueIntent = '';
        s.partnerGuess = '';
        s.accuracyRating = 0;
        s.confidenceRating = 0;
    });

    gameState.partnerB.scenarios.forEach(s => {
        s.text = '';
        s.trueIntent = '';
        s.partnerGuess = '';
        s.accuracyRating = 0;
        s.confidenceRating = 0;
    });

    gameState.currentPhase = "landing";
    gameState.firstPlayer = "A";
    gameState.currentPlayer = null;
    gameState.currentScenarioIndex = 0;
    gameState.guessingPhase = {
        guesser: null,
        writer: null,
        scenarioIndex: 0
    };
    gameState.revealPhase = {
        writer: null,
        guesser: null,
        scenarioIndex: 0,
        isPartnerAComplete: false
    };
    gameState.attunementScore = 0;

    // Reset radio selection
    document.querySelector('input[name="first-player"][value="A"]').checked = true;

    // Return to landing page
    showPage('landing-page');
}

// ===== SLIDER INTERACTIVITY =====
document.addEventListener('DOMContentLoaded', function() {
    // Update slider values in real-time
    const accuracySlider = document.getElementById('accuracy-slider');
    const confidenceSlider = document.getElementById('confidence-slider');
    const accuracyValue = document.getElementById('accuracy-value');
    const confidenceValue = document.getElementById('confidence-value');

    if (accuracySlider) {
        accuracySlider.addEventListener('input', function() {
            accuracyValue.textContent = this.value;
        });
    }

    if (confidenceSlider) {
        confidenceSlider.addEventListener('input', function() {
            confidenceValue.textContent = this.value;
        });
    }

    console.log('Mirror Intentions loaded. No data is being tracked or stored.');
});
