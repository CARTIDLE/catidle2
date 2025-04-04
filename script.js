let totalGames = 0;
let totalCorrect = 0;
let currentWinStreak = 0;
let bestWinStreak = 0;
let gameInitialized = false;

function initializeGame() {
  if (gameInitialized) return;
  gameInitialized = true;
  
  if (hasPlayedToday() && !isNewSongPeriod()) {
    const savedGame = localStorage.getItem("cartidle_todayGuesses");
  
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        
        attempts = gameData.attempts || 0;
        guessedSongs = gameData.songs || [];
        isGameOver = true; 
        
        if (gameData.tableData && gameData.tableData.length > 0) {
          rebuildGuessesTable(gameData.tableData);
        }
        
        document.getElementById('guessInput').disabled = true;
        document.getElementById('guessButton').style.display = "none";
        document.getElementById('showResultsButton').style.display = "block";
      } catch (e) {
        console.error("Error loading game state:", e);
        resetGame();
      }
    }
  } else if (isNewSongPeriod()) {
    localStorage.removeItem("cartidle_todayGuesses");
    resetGame();
    
    if (getCookie("modalsShown") !== "true") {
      document.getElementById('welcomeModal').style.display = 'flex';
      document.getElementById('instructionsModal').style.display = 'none';
    }
  } else {
    const savedGame = localStorage.getItem("cartidle_todayGuesses");
    
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        
        attempts = gameData.attempts || 0;
        guessedSongs = gameData.songs || [];
        isGameOver = gameData.isGameOver || false;
        
        if (gameData.tableData && gameData.tableData.length > 0) {
          rebuildGuessesTable(gameData.tableData);
        }
        
        if (isGameOver) {
          document.getElementById('guessInput').disabled = true;
          document.getElementById('guessButton').style.display = "none";
          document.getElementById('showResultsButton').style.display = "block";
          markPlayedToday();
        } else {
          document.getElementById('guessInput').disabled = false;
          document.getElementById('guessButton').style.display = "block";
          document.getElementById('showResultsButton').style.display = "none";
          document.getElementById('guessInput').placeholder = `Attempts left: ${maxAttempts - attempts}`;
        }
      } catch (e) {
        console.error("Error loading game state:", e);
        resetGame();
      }
    } else {
      resetGame();
    }
  }
}

function resetGame() {
  attempts = 0;
  guessedSongs = [];
  isGameOver = false;
  document.getElementById('guessesTable').innerHTML = '';
  document.getElementById('guessInput').disabled = false;
  document.getElementById('guessButton').style.display = "block";
  document.getElementById('showResultsButton').style.display = "none";
  document.getElementById('guessInput').placeholder = `Attempts left: ${maxAttempts}`;
}

document.getElementById('supportUsButton').addEventListener('click', function() {
  window.open("https://ko-fi.com/cartidle", "_blank");
});

let lastGameWon = false; 

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return "";
}

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

function isNewSession() {
  const oldSessionId = sessionStorage.getItem("cartidle_sessionId");
  const newSessionId = generateSessionId();
  sessionStorage.setItem("cartidle_sessionId", newSessionId);
  return oldSessionId !== null && oldSessionId !== newSessionId;
}

document.addEventListener('DOMContentLoaded', function() {
  initializeGame();
  
  loadStats();
  updateStatsDisplay();
  
  if (isNewSongPeriod()) {
    document.getElementById('welcomeModal').style.display = 'flex';
    document.getElementById('instructionsModal').style.display = 'none';

    document.getElementById('welcomeModal').addEventListener('click', function() {
      transitionToInstructions();
    });

    document.getElementById('instructionsModal').addEventListener('click', function(event) {
      const modalContent = this.querySelector('.modal-content');
      if (!modalContent.contains(event.target)) {
        this.style.opacity = 0;
        setTimeout(() => {
          this.style.display = 'none';
          this.style.opacity = 1;
          localStorage.setItem("cartidle_lastSongPeriod", periodIndex.toString());
          setCookie("modalsShown", "true", 1);
        }, 500);
      }
    });
  } else {
    document.getElementById('welcomeModal').style.display = 'none';
    document.getElementById('instructionsModal').style.display = 'none';
  }
  
  document.getElementById('guessButton').addEventListener('click', handleGuess);
  document.getElementById('showResultsButton').addEventListener('click', showStatsModal);
  
  const infoIcon = document.getElementById('infoIcon');
  if (infoIcon) {
    infoIcon.addEventListener('click', openInstructionsModal);
  }
  
  const donateIcon = document.getElementById('donateIcon');
  if (donateIcon) {
    donateIcon.addEventListener('click', openDonateModal);
  }
});



function transitionToInstructions() {
  const welcomeModal = document.getElementById('welcomeModal');
  const instructionsModal = document.getElementById('instructionsModal');
  welcomeModal.style.opacity = 0;
  setTimeout(() => {
    welcomeModal.style.display = 'none';
    instructionsModal.style.display = 'flex';
    instructionsModal.style.opacity = 0;
    void instructionsModal.offsetWidth;
    instructionsModal.style.transition = 'opacity 0.5s ease-out';
    instructionsModal.style.opacity = 1;
  }, 500);
}

function saveStats() {
  const stats = {
    totalGames: totalGames,
    totalCorrect: totalCorrect,
    currentWinStreak: currentWinStreak,
    bestWinStreak: bestWinStreak
  };
  localStorage.setItem("cartidle_playerStats", JSON.stringify(stats));
}

function loadStats() {
  const statsData = localStorage.getItem("cartidle_playerStats");
  if (statsData) {
    try {
      const stats = JSON.parse(statsData);
      totalGames = stats.totalGames || 0;
      totalCorrect = stats.totalCorrect || 0;
      currentWinStreak = stats.currentWinStreak || 0;
      bestWinStreak = stats.bestWinStreak || 0;
    } catch (e) {
      console.error("Error parsing stats data:", e);
      totalGames = 0;
      totalCorrect = 0;
      currentWinStreak = 0;
      bestWinStreak = 0;
    }
  }
}

function hasPlayedToday() {
  const lastPlayedDate = localStorage.getItem("cartidle_lastPlayedDate");
  const savedGuesses = localStorage.getItem("cartidle_todayGuesses");
  
  if (!lastPlayedDate || !savedGuesses) return false;
  
  try {
    const guesses = JSON.parse(savedGuesses);
    if (!guesses.isGameOver) return false;
    
    const today = new Date().toDateString();
    return lastPlayedDate === today;
  } catch (e) {
    console.error("Error parsing saved guesses in hasPlayedToday:", e);
    return false;
  }
}

function markPlayedToday() {
  const today = new Date().toDateString();
  localStorage.setItem("cartidle_lastPlayedDate", today);
}

function isNewSongPeriod() {
  const lastSongPeriod = localStorage.getItem("cartidle_lastSongPeriod");
  if (!lastSongPeriod) return true;
  return parseInt(lastSongPeriod) !== periodIndex;
}

function saveSongPeriod() {
  localStorage.setItem("cartidle_lastSongPeriod", periodIndex.toString());
}

window.addEventListener('DOMContentLoaded', function() {
  if (!sessionStorage.getItem("cartidle_sessionId")) {
    sessionStorage.setItem("cartidle_sessionId", generateSessionId());
  }
  
  loadStats();
  updateStatsDisplay();
  if(getCookie("modalsShown") === "true") {
    document.getElementById('welcomeModal').style.display = 'none';
    document.getElementById('instructionsModal').style.display = 'none';
  }
  if (hasPlayedToday() && !isNewSongPeriod()) {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessButton').style.display = "none";
    document.getElementById('showResultsButton').style.display = "block";
    
    const savedGuesses = localStorage.getItem("cartidle_todayGuesses");
    if (savedGuesses) {
      try {
        const guesses = JSON.parse(savedGuesses);
        guessedSongs = guesses.songs || [];
        attempts = guesses.attempts || 0;
        isGameOver = guesses.isGameOver || false;
        rebuildGuessesTable(guesses.tableData || []);
      } catch (e) {
        console.error("Error parsing saved guesses:", e);
      }
    }
  } else if (isNewSongPeriod()) {
    localStorage.removeItem("cartidle_todayGuesses");
  }
});

function updateStatsDisplay() {
  const winStreakElems = document.querySelectorAll('[id="winStreak"]');
  const correctGuessesElems = document.querySelectorAll('[id="correctGuesses"]');
  const gamesPlayedElems = document.querySelectorAll('[id="gamesPlayed"]');
  const bestWinStreakElems = document.querySelectorAll('[id="bestWinStreak"]');

  winStreakElems.forEach(elem => { elem.textContent = currentWinStreak; });
  correctGuessesElems.forEach(elem => { elem.textContent = totalCorrect; });
  gamesPlayedElems.forEach(elem => { elem.textContent = totalGames; });
  bestWinStreakElems.forEach(elem => { elem.textContent = bestWinStreak; });
}

function saveGameProgress() {
  const tableData = [];
  const rows = document.getElementById('guessesTable').querySelectorAll('tr');

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length === 5) {
      const albumCell = cells[1];
      const albumContainer = albumCell.querySelector('.album-container');
      const arrowSpan = albumContainer ? albumContainer.querySelector('span') : null;
      let hasArrowUp = false;
      let hasArrowDown = false;
      
      if (arrowSpan) {
        hasArrowUp = arrowSpan.classList.contains('arrow-up');
        hasArrowDown = arrowSpan.classList.contains('arrow-down');
      }
      
      const rowData = {
        song: cells[0].textContent,
        album: cells[1].querySelector('img')?.src.split('/').pop() || '',
        trackNo: cells[2].textContent,
        trackLength: cells[3].textContent,
        features: cells[4].textContent,
        cellClasses: [
          [...cells[0].classList],
          [...cells[1].classList],
          [...cells[2].classList],
          [...cells[3].classList],
          [...cells[4].classList]
        ],
        hasArrowUp: hasArrowUp,
        hasArrowDown: hasArrowDown
      };
      tableData.push(rowData);
    }
  });

  const gameData = {
    songs: guessedSongs,
    attempts: attempts,
    isGameOver: isGameOver,
    tableData: tableData,
    timestamp: new Date().getTime()
  };

  localStorage.setItem("cartidle_todayGuesses", JSON.stringify(gameData));
  
  if (isGameOver) {
    markPlayedToday();
    saveSongPeriod();
  }
}

function rebuildGuessesTable(tableData) {
  const guessesTable = document.getElementById('guessesTable');
  guessesTable.innerHTML = '';

  tableData.forEach(rowData => {
    const newRow = document.createElement('tr');
    
    const songCell = document.createElement('td');
    songCell.textContent = rowData.song;
    rowData.cellClasses[0].forEach(cls => songCell.classList.add(cls));
    
    const albumCell = document.createElement('td');
    albumCell.classList.add('album-cell');
    rowData.cellClasses[1].forEach(cls => albumCell.classList.add(cls));
    
    const albumContainer = document.createElement('div');
    albumContainer.classList.add('album-container');
    albumContainer.style.width = '100%';
    
    const albumImg = document.createElement('img');
    albumImg.src = `photo/${rowData.album}`;
    albumImg.alt = rowData.album;
    albumImg.classList.add('album-image');
    albumImg.style.marginRight = "10px";
    albumContainer.appendChild(albumImg);
    
    if (rowData.hasArrowUp || rowData.hasArrowDown) {
      const arrowSpan = document.createElement('span');
      if (rowData.hasArrowUp) {
        arrowSpan.classList.add('arrow-up');
      } else if (rowData.hasArrowDown) {
        arrowSpan.classList.add('arrow-down');
      }
      arrowSpan.style.width = "15px";
      arrowSpan.style.display = "inline-block";
      arrowSpan.style.textAlign = "right";
      albumContainer.appendChild(arrowSpan);
    }
    
    albumCell.appendChild(albumContainer);
    
    const trackNoCell = document.createElement('td');
    trackNoCell.textContent = rowData.trackNo;
    rowData.cellClasses[2].forEach(cls => trackNoCell.classList.add(cls));
    
    const trackLengthCell = document.createElement('td');
    trackLengthCell.textContent = rowData.trackLength;
    rowData.cellClasses[3].forEach(cls => trackLengthCell.classList.add(cls));
    
    const featuresCell = document.createElement('td');
    featuresCell.textContent = rowData.features;
    rowData.cellClasses[4].forEach(cls => featuresCell.classList.add(cls));
    
    newRow.appendChild(songCell);
    newRow.appendChild(albumCell);
    newRow.appendChild(trackNoCell);
    newRow.appendChild(trackLengthCell);
    newRow.appendChild(featuresCell);
    
    guessesTable.appendChild(newRow);
  });
}

window.addEventListener('load', function() {
  const currentSessionId = sessionStorage.getItem("cartidle_sessionId");
  const previousSessionId = localStorage.getItem("cartidle_lastSessionId");
  
  loadStats();
  updateStatsDisplay();

  let shouldRestoreGameState = false;

  if (currentSessionId !== previousSessionId) {
    localStorage.setItem("cartidle_lastSessionId", currentSessionId);
    
    const savedGuesses = localStorage.getItem("cartidle_todayGuesses");
    if (savedGuesses) {
      try {
        const guesses = JSON.parse(savedGuesses);
        
        if (!guesses.isGameOver) {
          shouldRestoreGameState = true;
          
          attempts = guesses.attempts || 0;
          guessedSongs = guesses.songs || [];
          isGameOver = false;
          
          if (guesses.tableData) {
            rebuildGuessesTable(guesses.tableData);
          }
        }
      } catch (e) {
        console.error("Error handling unfinished game:", e);
      }
    }
  }

  if (hasPlayedToday() && !isNewSongPeriod()) {
    const savedGuesses = localStorage.getItem("cartidle_todayGuesses");
    if (savedGuesses) {
      try {
        const guesses = JSON.parse(savedGuesses);
        
        guessedSongs = guesses.songs || [];
        attempts = guesses.attempts || 0;
        isGameOver = guesses.isGameOver || false;
        
        // Only set game over UI if the game is actually over
        if (isGameOver) {
          document.getElementById('guessInput').disabled = true;
          document.getElementById('guessButton').style.display = "none";
          document.getElementById('showResultsButton').style.display = "block";
        } else {
          document.getElementById('guessInput').disabled = false;
          document.getElementById('guessButton').style.display = "block";
          document.getElementById('showResultsButton').style.display = "none";
          document.getElementById('guessInput').placeholder = `Attempts left: ${maxAttempts - attempts}`;
        }
        
        rebuildGuessesTable(guesses.tableData || []);
      } catch (e) {
        console.error("Error parsing saved guesses:", e);
      }
    }
  } else if (isNewSongPeriod()) {
    localStorage.removeItem("cartidle_todayGuesses");
    
    attempts = 0;
    guessedSongs = [];
    isGameOver = false;
    
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessButton').style.display = "block";
    document.getElementById('showResultsButton').style.display = "none";
    document.getElementById('guessInput').placeholder = `Attempts left: ${maxAttempts}`;
  }

  const modalsCookie = getCookie("modalsShown");
  if (modalsCookie === "true") {
    document.getElementById('welcomeModal').style.display = 'none';
    document.getElementById('instructionsModal').style.display = 'none';
  }
});

window.addEventListener('beforeunload', function() {
  const savedGuesses = localStorage.getItem("cartidle_todayGuesses");
  if (savedGuesses) {
    try {
      const guesses = JSON.parse(savedGuesses);
      if (guesses.attempts > 0 && !guesses.isGameOver) {
        localStorage.setItem("cartidle_lastSessionId", sessionStorage.getItem("cartidle_sessionId"));
      }
    } catch (e) {
      console.error("Error saving session state:", e);
    }
  }
});

function handleGuess() {
  const userGuess = document.getElementById('guessInput').value.trim();
  if (userGuess !== "") {
    document.getElementById('result').innerHTML = "";
  } else {
    document.getElementById('result').innerHTML = "<p>Please enter a song title!</p>";
    return;
  }

  if (attempts >= maxAttempts || isGameOver) return;

  const guessedSong = songsDatabase.find(song => song.song.toLowerCase() === userGuess.toLowerCase());
  if (guessedSong && !guessedSongs.includes(guessedSong.song)) {
    attempts++;
    guessedSongs.push(guessedSong.song);

    const newRow = document.createElement('tr');
    const songCell = document.createElement('td');
    const albumCell = document.createElement('td');
    const trackNoCell = document.createElement('td');
    const trackLengthCell = document.createElement('td');
    const featuresCell = document.createElement('td');

    songCell.textContent = guessedSong.song;

    const albumContainer = document.createElement('div');
    albumContainer.classList.add('album-container');
    albumContainer.style.width = '100%';

    const albumImg = document.createElement('img');
    albumImg.src = `photo/${guessedSong.album}`;
    albumImg.alt = guessedSong.album;
    albumImg.classList.add('album-image');
    albumImg.style.marginRight = "10px";
    albumContainer.appendChild(albumImg);

   
    if (guessedSong.album !== randomSong.album) {
      const arrowSpan = document.createElement('span');
      const albumOrder = ["iammusic.jpg", "wholelottared.jpg", "dieeelittt.jpg", "selftitled.jpg"];
      const correctIndex = albumOrder.indexOf(randomSong.album);
      const guessedIndex = albumOrder.indexOf(guessedSong.album);
      if (guessedIndex !== -1 && correctIndex !== -1 && Math.abs(guessedIndex - correctIndex) === 1) {
        albumCell.classList.add('neighbor');
      }
      
      if (albumReleaseYears[guessedSong.album] < albumReleaseYears[randomSong.album]) {
        arrowSpan.classList.add('arrow-up');
      } else {
        arrowSpan.classList.add('arrow-down');
      }
      arrowSpan.style.width = "15px";
      arrowSpan.style.display = "inline-block";
      arrowSpan.style.textAlign = "right";
      albumContainer.appendChild(arrowSpan);
    }

    albumCell.appendChild(albumContainer);
    albumCell.classList.add('album-cell');

    trackNoCell.textContent = guessedSong.trackNo;
    trackLengthCell.textContent = guessedSong.trackLength;
    featuresCell.textContent = guessedSong.features;

    highlightCell(songCell, guessedSong.song === randomSong.song, true);
    highlightCell(albumCell, guessedSong.album === randomSong.album);
    highlightNumericCell(trackNoCell, guessedSong.trackNo, randomSong.trackNo);
    highlightTimeCell(trackLengthCell, guessedSong.trackLength, randomSong.trackLength);
    highlightCell(featuresCell, guessedSong.features === randomSong.features);

    newRow.appendChild(songCell);
    newRow.appendChild(albumCell);
    newRow.appendChild(trackNoCell);
    newRow.appendChild(trackLengthCell);
    newRow.appendChild(featuresCell);

    newRow.classList.add('fade-in');
    document.getElementById('guessesTable').appendChild(newRow);

    if (guessedSong.song === randomSong.song) {
      isGameOver = true;
      totalGames++;
      totalCorrect++;
      currentWinStreak++;
      if (currentWinStreak > bestWinStreak) {
        bestWinStreak = currentWinStreak;
      }
      saveStats();
      saveGameProgress();
      showEndGameModal(true);
      document.getElementById('guessButton').style.display = "none";
      document.getElementById('showResultsButton').style.display = "block";
    } else if (attempts >= maxAttempts) {
      isGameOver = true;
      totalGames++;
      currentWinStreak = 0;
      saveStats();
      saveGameProgress();
      showEndGameModal(false);
      document.getElementById('guessButton').style.display = "none";
      document.getElementById('showResultsButton').style.display = "block";
    } else {
      saveGameProgress();
    }
  } else {
    document.getElementById('result').innerHTML = "<p>Song not found or already guessed!</p>";
  }
  document.getElementById('guessInput').value = '';
  document.getElementById('guessInput').placeholder = `Attempts left: ${maxAttempts - attempts}`;
}
function showEndGameModal(isWin) {
  lastGameWon = isWin; 

  const modalContent = document.getElementById('endGameContent');
  modalContent.innerHTML = originalModalContent;

  const marquee = modalContent.querySelector('.album-divider .marquee');
  if (marquee) {
    let imagesHTML = "";
    const numCopies = 30;
    for (let i = 0; i < numCopies; i++) {
      imagesHTML += `<img src="photo/${randomSong.album}" alt="Album Cover" style="width: 50px; height: auto;">`;
    }
    marquee.innerHTML = imagesHTML;
  }

  document.getElementById('donationContainer').style.display = "block";
  document.getElementById('finalFeatures').style.display = (randomSong.features === "None" ? "none" : "block");

  const endGameTitle = document.getElementById('endGameTitle');
  const finalSongName = document.getElementById('finalSongName');
  const finalFeatures = document.getElementById('finalFeatures');

  endGameTitle.textContent = isWin ? "You guessed it!" : "Game Over!";
  finalSongName.textContent = randomSong.song;
  if (randomSong.features !== "None") {
    finalFeatures.textContent = "ft. " + randomSong.features;
  }

  let timerElem = document.createElement('div');
  timerElem.id = "timerCountdown";
  timerElem.style.margin = "10px 0";
  const statsContainer = modalContent.querySelector('.stats-container');
  if (statsContainer) {
    modalContent.insertBefore(timerElem, statsContainer);
  }
  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdown(timerElem);
  countdownInterval = setInterval(() => { updateCountdown(timerElem); }, 1000);

  updateAlbumCover();
  updateStatsDisplay();
  document.getElementById('guessInput').disabled = true;
  showModal('endGameModal');

  const supportButtons = document.querySelectorAll('#supportUsButton');
  supportButtons.forEach(button => {
    button.addEventListener('click', function() {
      window.open("https://ko-fi.com/cartidle", "_blank");
    });
  });
}

function showStatsModal() {
  const modalContent = document.getElementById('endGameContent');
  modalContent.innerHTML = originalModalContent;

  const albumCover = document.getElementById('albumCover');
  const endGameTitle = document.getElementById('endGameTitle');
  const finalSongName = document.getElementById('finalSongName');
  const finalFeatures = document.getElementById('finalFeatures');
  const statsContainer = modalContent.querySelector('.stats-container');
  const donationContainer = document.getElementById('donationContainer');

  donationContainer.style.display = "none";

  modalContent.innerHTML = "";

  if (lastGameWon) {
    finalSongName.textContent = "Guessed Song: " + randomSong.song;
  } else {
    finalSongName.textContent = "Today's Song: " + randomSong.song;
  }

  modalContent.appendChild(finalSongName);

  if (randomSong.features !== "None") {
    finalFeatures.textContent = "(feat " + randomSong.features + ")";
    finalFeatures.style.display = "block";
    modalContent.appendChild(finalFeatures);
  }

  modalContent.appendChild(albumCover);

  let timerElem = document.createElement('div');
  timerElem.id = "timerCountdown";
  timerElem.style.margin = "10px 0";
  modalContent.appendChild(timerElem);

  modalContent.appendChild(endGameTitle);
  modalContent.appendChild(statsContainer);

  endGameTitle.textContent = "Your Stats";

  updateAlbumCover();

  document.getElementById('winStreak').textContent = currentWinStreak;
  document.getElementById('correctGuesses').textContent = totalCorrect;
  document.getElementById('gamesPlayed').textContent = totalGames;
  document.getElementById('bestWinStreak').textContent = bestWinStreak;

  document.getElementById('guessInput').disabled = true;

  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdown(timerElem);
  countdownInterval = setInterval(() => { updateCountdown(timerElem); }, 1000);

  showModal('endGameModal');

  const supportButtons = document.querySelectorAll('#supportUsButton');
  supportButtons.forEach(button => {
    button.addEventListener('click', function() {
      window.open("https://ko-fi.com/cartidle", "_blank");
    });
  });
}
document.getElementById('showResultsButton').addEventListener('click', showStatsModal);

const originalModalContent = document.getElementById('endGameContent').innerHTML;

function updateAlbumCover() {
  const albumCover = document.getElementById('albumCover');
  albumCover.src = `photo/${randomSong.album}`;
  albumCover.style.display = "block";
}


document.getElementById('donateModal').addEventListener('click', function(event) {
  const modalContent = this.querySelector('.modal-content');
  if (!modalContent.contains(event.target)) {
    this.style.opacity = 0;
    setTimeout(() => {
      this.style.display = 'none';
      this.style.opacity = 1;
    }, 500);
  }
});

function getCountdownString() {
  const now = new Date();
  const ref = new Date(2020, 0, 1, 0, 0, 0, 0);
  const periodMs = 12 * 60 * 60 * 1000;
  const diff = now - ref;
  const remainderMs = diff % periodMs;
  const remainingMs = periodMs - remainderMs;
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

let countdownInterval = null;

function updateCountdown(elem) {
  if (elem) {
    elem.textContent = "Next song in: " + getCountdownString();
  }
}

const songsDatabase = [
         //I AM MUSIC (2025)
   { song: "POP OUT", album: "iammusic.jpg", trackNo: 1, trackLength: "2:41", features: "None" },
   { song: "CRUSH", album: "iammusic.jpg", trackNo: 2, trackLength: "2:53", features: "Travis Scott" },
   { song: "K POP", album: "iammusic.jpg", trackNo: 3, trackLength: "1:52", features: "None" },
   { song: "EVIL J0RDAN", album: "iammusic.jpg", trackNo: 4, trackLength: "3:03", features: "None" },
   { song: "MOJO JOJO", album: "iammusic.jpg", trackNo: 5, trackLength: "2:36", features: "None" },
   { song: "PHILLY", album: "iammusic.jpg", trackNo: 6, trackLength: "3:05", features: "Travis Scott" },
   { song: "RADAR", album: "iammusic.jpg", trackNo: 7, trackLength: "1:47", features: "None" },
   { song: "RATHER LIE", album: "iammusic.jpg", trackNo: 8, trackLength: "3:29", features: "The Weeknd" },
   { song: "FINE SHIT", album: "iammusic.jpg", trackNo: 9, trackLength: "1:46", features: "None" },
   { song: "BACKD00R", album: "iammusic.jpg", trackNo: 10, trackLength: "3:10", features: "Kendrick Lamar,  Jhené Aiko" },
   { song: "TOXIC", album: "iammusic.jpg", trackNo: 11, trackLength: "2:15", features: "Skepta" },
   { song: "MUNYUN", album: "iammusic.jpg", trackNo: 12, trackLength: "2:34", features: "None" },
   { song: "CRANK", album: "iammusic.jpg", trackNo: 13, trackLength: "2:27", features: "None" },
   { song: "CHARGE DEM HOES A FEE", album: "iammusic.jpg", trackNo: 14, trackLength: "3:45", features: "Future, Travis Scott" },
   { song: "GOOD CREDIT", album: "iammusic.jpg", trackNo: 15, trackLength: "3:10", features: "Kendrick Lamar" },
   { song: "I SEEEEEE YOU BABY BOI", album: "iammusic.jpg", trackNo: 16, trackLength: "2:38", features: "None" },
   { song: "WAKE UP F1LTHY", album: "iammusic.jpg", trackNo: 17, trackLength: "2:49", features: "Travis Scott" },
   { song: "JUMPIN", album: "iammusic.jpg", trackNo: 18, trackLength: "1:32", features: "Lil Uzi Vert" },
   { song: "TRIM", album: "iammusic.jpg", trackNo: 19, trackLength: "3:13", features: "Future" },
   { song: "COCAINE NOSE", album: "iammusic.jpg", trackNo: 20, trackLength: "2:31", features: "None" },
   { song: "WE NEED ALL DA VIBES", album: "iammusic.jpg", trackNo: 21, trackLength: "3:01", features: "Young Thug, Ty Dolla $ign" },
   { song: "OLYMPIAN", album: "iammusic.jpg", trackNo: 22, trackLength: "2:54", features: "None" },
   { song: "OPM BABI", album: "iammusic.jpg", trackNo: 23, trackLength: "2:53", features: "Lil Uzi Vert" },
   { song: "TWIN TRIM", album: "iammusic.jpg", trackNo: 24, trackLength: "1:34", features: "None" },
   { song: "LIKE WEEZY", album: "iammusic.jpg", trackNo: 25, trackLength: "1:55", features: "None" },
   { song: "DIS 1 GOT IT", album: "iammusic.jpg", trackNo: 26, trackLength: "2:03", features: "None" },
   { song: "WALK", album: "iammusic.jpg", trackNo: 27, trackLength: "1:34", features: "None" },
   { song: "HBA", album: "iammusic.jpg", trackNo: 28, trackLength: "3:32", features: "None" },
   { song: "OVERLY", album: "iammusic.jpg", trackNo: 29, trackLength: "1:45", features: "None" },
   { song: "SOUTH ATLANTA BABY", album: "iammusic.jpg", trackNo: 30, trackLength: "2:13", features: "None" },
   { song: "DIFFERENT DAY", album: "iammusic.jpg", trackNo: 31, trackLength: "2:46", features: "None" },
   { song: "2024", album: "iammusic.jpg", trackNo: 32, trackLength: "3:29", features: "None" },
   { song: "BACKR00MS", album: "iammusic.jpg", trackNo: 33, trackLength: "2:40", fetures: "Travis Scott" },
   { song: "FOMDJ", album: "iammusic.jpg", trackNo: 34, trackLength: "3:20", features: "None" },

   // Whole Lotta Red (2020)   
   { song: "Rockstar Made", album: "wholelottared.jpg", trackNo: 1, trackLength: "3:13", features: "None"},
   { song: "Go2DaMoon", album: "wholelottared.jpg", trackNo: 2, trackLength: "1:59", features: "Kanye West"},
   { song: "Stop Breathing", album: "wholelottared.jpg", trackNo: 3, trackLength: "3:38", features: "None"},
   { song: "Beno!", album: "wholelottared.jpg", trackNo: 4, trackLength: "2:33", features: "None"},
   { song: "JumpOutTheHouse", album: "wholelottared.jpg", trackNo: 5, trackLength: "1:33", features: "None"},
   { song: "M3tamorphosis", album: "wholelottared.jpg", trackNo: 6, trackLength: "5:12", features: "Kid Cudi"},
   { song: "Slay3r", album: "wholelottared.jpg", trackNo: 7, trackLength: "2:44", features: "None"},
   { song: "No Sl33p", album: "wholelottared.jpg", trackNo: 8, trackLength: "1:28", features: "None"},
   { song: "New Tank", album: "wholelottared.jpg", trackNo: 9, trackLength: "1:29", features: "None"},
   { song: "Teen X", album: "wholelottared.jpg", trackNo: 10, trackLength: "3:25", features: "Future"},
   { song: "Meh", album: "wholelottared.jpg", trackNo: 11, trackLength: "1:58", features: "None"},
   { song: "Vamp Anthem", album: "wholelottared.jpg", trackNo: 12, trackLength: "2:04", features: "None"},
   { song: "New N3on", album: "wholelottared.jpg",trackNo: 13, trackLength: "1:56", features: "None"},
   { song: "Control", album: "wholelottared.jpg", trackNo: 14, trackLength: "3:17", features: "None"},
   { song: "Punk Monk", album: "wholelottared.jpg", trackNo: 15, trackLength: "3:49", features: "None"},
   { song: "On That Time", album: "wholelottared.jpg", trackNo: 16, trackLength: "1:42", features: "None"},
   { song: "King Vamp", album: "wholelottared.jpg", trackNo: 17, trackLength: "3:06", features: "None"},
   { song: "Place", album: "wholelottared.jpg", trackNo: 18, trackLength: "1:57", features: "None"},
   { song: "Sky", album: "wholelottared.jpg", trackNo: 19, trackLength: "3:13", features: "None"},
   { song: "Over", album: "wholelottared.jpg", trackNo: 20, trackLength: "2:46", features: "None"},
   { song: "ILoveUIHateU", album: "wholelottared.jpg", trackNo: 21, trackLength: "2:15", features: "None"},
   { song: "Die4Guy", album: "wholelottared.jpg", trackNo: 22, trackLength: "2:11", features: "None"},
   { song: "Not PLaying", album: "wholelottared.jpg", trackNo: 23, trackLength: "2:10", features: "None"},
   { song: "F33l Lik3 Dyin", album: "wholelottared.jpg", trackNo: 24, trackLength: "3:24", features: "None"},
   
   // Die Lit (2018)
   { song: "Long Time", album: "dieeelittt.jpg", trackNo: 1, trackLength: "3:31", features: "None" },
   { song: "R.I.P.", album: "dieeelittt.jpg", trackNo: 2, trackLength: "3:12", features: "None" },
   { song: "Lean 4 Real", album: "dieeelittt.jpg", trackNo: 3, trackLength: "2:57", features: "Skepta" },
   { song: "Old Money", album: "dieeelittt.jpg", trackNo: 4, trackLength: "2:15", features: "None" },
   { song: "Love Hurts", album: "dieeelittt.jpg", trackNo: 5, trackLength: "3:00", features: "Travis Scott" },
   { song: "Shoota", album: "dieeelittt.jpg", trackNo: 6, trackLength: "2:33", features: "Lil Uzi Vert" },
   { song: "Right Now", album: "dieeelittt.jpg", trackNo: 7, trackLength: "3:27", features: "Pi'erre Bourne" },
   { song: "Poke It Out", album: "dieeelittt.jpg", trackNo: 8, trackLength: "4:29", features: "Nicki Minaj" },
   { song: "Home (KOD)", album: "dieeelittt.jpg", trackNo: 9, trackLength: "2:42", features: "None" },
   { song: "Fell In Luv", album: "dieeelittt.jpg", trackNo: 10, trackLength: "3:26", features: "Bryson Tiller" },
   { song: "Foreign", album: "dieeelittt.jpg", trackNo: 11, trackLength: "2:22", features: "None" },
   { song: "Pull Up", album: "dieeelittt.jpg", trackNo: 12, trackLength: "3:36", features: "None" },
   { song: "Mileage", album: "dieeelittt.jpg", trackNo: 13, trackLength: "2:29", features: "Chief Keef" },
   { song: "FlatBed Freestyle", album: "dieeelittt.jpg", trackNo: 14, trackLength: "3:13", features: "None" },
   { song: "No Time", album: "dieeelittt.jpg", trackNo: 15, trackLength: "3:14", features: "Gunna" },
   { song: "Middle of the Summer", album: "dieeelittt.jpg", trackNo: 16, trackLength: "2:17", features: "Red Coldhearted" },
   { song: "Choppa Won't Miss", album: "dieeelittt.jpg", trackNo: 17, trackLength: "3:37", features: "Young Thug" },
   { song: "R.I.P. Fredo", album: "dieeelittt.jpg", trackNo: 18, trackLength: "2:41", features: "Young Nudy" },
   { song: "Top", album: "dieeelittt.jpg", trackNo: 19, trackLength: "2:13", features: "Pi'erre Bourne" },

   // Playboi Carti (2017)
   { song: "Location", album: "selftitled.jpg", trackNo: 1, trackLength: "2:48", features: "None" },
   { song: "Magnolia", album: "selftitled.jpg", trackNo: 2, trackLength: "3:01", features: "None" },
   { song: "Lookin", album: "selftitled.jpg", trackNo: 3, trackLength: "3:03", features: "Lil Uzi Vert" },
   { song: "Wokeuplikethis*", album: "selftitled.jpg", trackNo: 4, trackLength: "3:55", features: "Lil Uzi Vert" },
   { song: "Let It Go", album: "selftitled.jpg", trackNo: 5, trackLength: "2:30", features: "None" },
   { song: "Half & Half", album: "selftitled.jpg", trackNo: 6, trackLength: "3:47", features: "None" },
   { song: "New Choppa", album: "selftitled.jpg", trackNo: 7, trackLength: "2:06", features: "A$AP Rocky" },
   { song: "Other Sh*t", album: "selftitled.jpg", trackNo: 8, trackLength: "2:48", features: "None" },
   { song: "NO. 9", album: "selftitled.jpg", trackNo: 9, trackLength: "3:19", features: "None" },
   { song: "Dothatshit!", album: "selftitled.jpg", trRilklaleackNo: 10, trackLength: "3:04", features: "None" },
   { song: "Lame N***as", album: "selftitled.jpg", trackNo: 11, trackLength: "2:53", features: "None" },
   { song: "Yah Mean", album: "selftitled.jpg", trackNo: 12, trackLength: "2:45", features: "None" },
   { song: "Flex", album: "selftitled.jpg", trackNo: 13, trackLength: "4:00", features: "Leven Kali" },
   { song: "Kelly K", album: "selftitled.jpg", trackNo: 14, trackLength: "4:31", features: "None" },
   { song: "Had 2", album: "selftitled.jpg", trackNo: 15, trackLength: "2:19", features: "None" }          
];
 

const albumReleaseYears = {
  "iammusic.jpg": 2025,
  "wholelottared.jpg": 2020,
  "dieeelittt.jpg": 2018,
  "selftitled.jpg": 2017
};

const now = new Date();
const ref = new Date(2020, 0, 1, 0, 0, 0, 0);
const diffHours = (now - ref) / (1 * 60 * 60);
const periodIndex = Math.floor(diffHours / 1);
const songIndex = ((periodIndex % songsDatabase.length) + songsDatabase.length) % songsDatabase.length;
let randomSong = songsDatabase[songIndex];

let attempts = 0;
const maxAttempts = 8;
let guessedSongs = [];
let isGameOver = false;

function showSuggestions() {
document.getElementById('result').innerHTML = "";
const input = document.getElementById('guessInput').value.toLowerCase();
const suggestionsList = document.getElementById('suggestionsList');
suggestionsList.innerHTML = '';
if (input.length > 0) {
  const filteredSongs = songsDatabase.filter(song =>
    song.song.toLowerCase().startsWith(input) && !guessedSongs.includes(song.song)
  );
  filteredSongs.forEach(song => {
    const suggestionItem = document.createElement('li');
    suggestionItem.textContent = song.song;
    suggestionItem.onclick = function() {
      document.getElementById('guessInput').value = song.song;
      suggestionsList.innerHTML = '';
    };
    suggestionsList.appendChild(suggestionItem);
  });
}
}

function highlightCell(cell, isCorrect, isSong = false) {
if (isCorrect) cell.classList.add('correct');
}

function highlightNumericCell(cell, guessValue, correctValue) {
if (guessValue === correctValue) {
  cell.classList.add('correct');
} else if (Math.abs(guessValue - correctValue) === 1) {
  cell.classList.add('neighbor');
  cell.classList.add(guessValue < correctValue ? 'arrow-up' : 'arrow-down');
} else {
  cell.classList.add(guessValue < correctValue ? 'arrow-up' : 'arrow-down');
}
}

function highlightTimeCell(cell, guessTime, correctTime) {
const guessSeconds = convertToSeconds(guessTime);
const correctSeconds = convertToSeconds(correctTime);
if (guessTime === correctTime) {
  cell.classList.add('correct');
} else if (Math.abs(guessSeconds - correctSeconds) <= 15) {
  cell.classList.add('neighbor');
  cell.classList.add(guessSeconds < correctSeconds ? 'arrow-up' : 'arrow-down');
} else {
  cell.classList.add(guessSeconds < correctSeconds ? 'arrow-up' : 'arrow-down');
}
}

function convertToSeconds(time) {
const [minutes, seconds] = time.split(':').map(Number);
return minutes * 60 + seconds;
}

function showModal(modalId) {
const modal = document.getElementById(modalId);
modal.style.display = 'flex';
modal.style.opacity = 1;
}

document.getElementById('endGameModal').addEventListener('click', function(event) {
const modalContent = this.querySelector('.modal-content');
if (!modalContent.contains(event.target)) {
  this.style.opacity = 0;
  setTimeout(() => {
    this.style.display = 'none';
    this.style.opacity = 1;
  }, 500);
}
});



document.addEventListener('DOMContentLoaded', function() {

  const welcomeModal = document.getElementById('welcomeModal');
  const instructionsModal = document.getElementById('instructionsModal');
  
    
  
  if (instructionsModal) {
    // Remove any existing listeners to prevent duplicates
    const newInstructionsModal = instructionsModal.cloneNode(true);
    instructionsModal.parentNode.replaceChild(newInstructionsModal, instructionsModal);
    
    newInstructionsModal.addEventListener('click', function(event) {
      const modalContent = this.querySelector('.modal-content');
      if (!modalContent.contains(event.target)) {
        this.style.opacity = 0;
        setTimeout(() => {
          this.style.display = 'none';
          this.style.opacity = 1;
          localStorage.setItem("cartidle_lastSongPeriod", periodIndex.toString());
          setCookie("modalsShown", "true", 1);
        }, 500);
      }
    });
  }
});


function openInstructionsModal() {
const instructionsModal = document.getElementById('instructionsModal');
instructionsModal.style.display = 'flex';
instructionsModal.style.opacity = 1;
}

function openDonateModal() {
const donateModal = document.getElementById('donateModal');
donateModal.style.display = 'flex';
donateModal.style.opacity = 1;

}

document.getElementById('donateModal').addEventListener('click', function(event) {
const modalContent = this.querySelector('.modal-content');
if (!modalContent.contains(event.target)) {
  this.style.opacity = 0;
  setTimeout(() => {
    this.style.display = 'none';
    this.style.opacity = 1;
  }, 500);
}
});


function createShareButton() {
const existingButton = document.getElementById('shareScoreButton');
if (existingButton) {
existingButton.remove();
}

const shareButton = document.createElement('button');
shareButton.id = 'shareScoreButton';
shareButton.textContent = 'Share Score';
shareButton.className = 'share-score-button';

const timerElem = document.getElementById('timerCountdown');
if (timerElem) {
timerElem.parentNode.insertBefore(shareButton, timerElem);
} else {
const finalFeatures = document.getElementById('finalFeatures');
if (finalFeatures && finalFeatures.style.display !== 'none') {
  finalFeatures.parentNode.insertBefore(shareButton, finalFeatures.nextSibling);
} else {
  const finalSongName = document.getElementById('finalSongName');
  if (finalSongName) {
    finalSongName.parentNode.insertBefore(shareButton, finalSongName.nextSibling);
  }
}
}

shareButton.addEventListener('click', shareScore);
}



function shareScore() {
  const guessesTable = document.getElementById('guessesTable');
  const rows = guessesTable.querySelectorAll('tr');
  
  let shareText = `I guessed the song in ${attempts}/8 attempts! \n\n`;
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    let rowText = '';
    if (cells.length === 5) {
      cells.forEach(cell => {
        if (cell.classList.contains('correct')) {
          rowText += '🟩 ';
        } else if (cell.classList.contains('neighbor')) {
          rowText += '🟨 ';
        } else {
          rowText += '⬜ ';
        }
      });
      shareText += rowText + '\n';
    }
  });
  
  shareText += '\nhttps://cartidle.com';
  
  navigator.clipboard.writeText(shareText)
    .then(() => {
      showCopyNotification();
    })
    .catch(err => {
      console.error('Could not copy text: ', err);
    });
}



function showCopyNotification() {

let notification = document.getElementById('copyNotification');
if (!notification) {
notification = document.createElement('div');
notification.id = 'copyNotification';
notification.textContent = 'Score copied to clipboard!';
notification.className = 'copy-notification';

document.body.appendChild(notification);
}


notification.style.opacity = '1';


setTimeout(() => {
notification.style.opacity = '0';


setTimeout(() => {
  if (notification.parentNode) {
    notification.parentNode.removeChild(notification);
  }
}, 300);
}, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
if (document.getElementById('endGameModal').style.display === 'flex' ||
  document.getElementById('showResultsButton').style.display === 'block') {
createShareButton();
}

const showResultsButton = document.getElementById('showResultsButton');
if (showResultsButton) {
const originalClickHandler = showResultsButton.onclick;
showResultsButton.onclick = function() {
  if (originalClickHandler) {
    originalClickHandler.call(this);
  }
  setTimeout(createShareButton, 100);
};
}
});