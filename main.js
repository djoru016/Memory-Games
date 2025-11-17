    // Game variables
        const allIcons = ['🎮', '🎨', '🎭', '🎪', '🎯', '🎸', '🎺', '🎹', '🚀', '⚽', '🎲', '🎬', '🎪', '🎨', '🎯', '🎮'];
        let difficulty = 'medium';
        let cardIcons = [];
        let cards = [];
        let flippedCards = [];
        let matchedPairs = 0;
        let moves = 0;
        let time = 0;
        let timerInterval;
        let canFlip = true;
        let combo = 0;
        let maxCombo = 0;
        let totalPairs = 0;

        // Set difficulty
        function setDifficulty(level) {
            difficulty = level;
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
        }

        // Initialize game
        function startGame() {
            let numPairs;
            if (difficulty === 'easy') numPairs = 8;
            else if (difficulty === 'medium') numPairs = 12;
            else numPairs = 16;

            cardIcons = allIcons.slice(0, numPairs);
            totalPairs = numPairs;

            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('gameScreen').style.display = 'block';
            initializeCards();
            startTimer();
        }

        function initializeCards() {
            const cardPairs = [...cardIcons, ...cardIcons];
            cards = cardPairs.sort(() => Math.random() - 0.5);
            
            flippedCards = [];
            matchedPairs = 0;
            moves = 0;
            time = 0;
            combo = 0;
            maxCombo = 0;
            canFlip = true;
            
            document.getElementById('moves').textContent = '0';
            document.getElementById('combo').textContent = '0';
            document.getElementById('progressBar').style.width = '0%';
            
            const grid = document.getElementById('gameGrid');
            grid.innerHTML = '';
            grid.className = 'game-grid ' + difficulty;
            
            cards.forEach((icon, index) => {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = index;
                card.dataset.icon = icon;
                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-face card-back">❓</div>
                        <div class="card-face card-front">${icon}</div>
                    </div>
                `;
                card.addEventListener('click', flipCard);
                grid.appendChild(card);
            });
        }

        function flipCard(e) {
            if (!canFlip) return;
            
            const card = e.currentTarget;
            
            if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
            if (flippedCards.length >= 2) return;
            
            card.classList.add('flipped');
            flippedCards.push(card);
            playSound('flip');
            
            if (flippedCards.length === 2) {
                moves++;
                document.getElementById('moves').textContent = moves;
                checkMatch();
            }
        }

        function checkMatch() {
            canFlip = false;
            const [card1, card2] = flippedCards;
            const icon1 = card1.dataset.icon;
            const icon2 = card2.dataset.icon;
            
            if (icon1 === icon2) {
                setTimeout(() => {
                    card1.classList.add('matched');
                    card2.classList.add('matched');
                    matchedPairs++;
                    flippedCards = [];
                    canFlip = true;
                    playSound('match');
                    
                    combo++;
                    if (combo > maxCombo) maxCombo = combo;
                    document.getElementById('combo').textContent = combo;
                    
                    updateProgress();
                    
                    if (matchedPairs === totalPairs) {
                        setTimeout(winGame, 500);
                    }
                }, 500);
            } else {
                setTimeout(() => {
                    card1.classList.remove('flipped');
                    card2.classList.remove('flipped');
                    flippedCards = [];
                    canFlip = true;
                    
                    combo = 0;
                    document.getElementById('combo').textContent = '0';
                }, 1000);
            }
        }

        function updateProgress() {
            const progress = (matchedPairs / totalPairs) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
        }

        function startTimer() {
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
                time++;
                updateTimerDisplay();
            }, 1000);
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(time / 60);
            const seconds = time % 60;
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }

        function winGame() {
            clearInterval(timerInterval);
            document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
            document.getElementById('finalMoves').textContent = moves;
            document.getElementById('finalCombo').textContent = maxCombo;
            
            const rating = calculateRating();
            displayRating(rating);
            
            const gameScore = calculateGameScore();
            displayGameRating(gameScore);
            
            document.getElementById('gameScreen').style.display = 'none';
            document.getElementById('winScreen').style.display = 'block';
            playSound('win');
        }

        function calculateRating() {
            const perfectMoves = totalPairs;
            if (moves <= perfectMoves * 1.2) return 3;
            if (moves <= perfectMoves * 1.5) return 2;
            return 1;
        }

        function displayRating(stars) {
            const ratingDiv = document.getElementById('rating');
            ratingDiv.innerHTML = '';
            for (let i = 0; i < 3; i++) {
                ratingDiv.innerHTML += i < stars ? '⭐' : '☆';
            }
        }

        function calculateGameScore() {
            const perfectMoves = totalPairs;
            const perfectTime = totalPairs * 3;
            
            let moveScore = 5;
            if (moves > perfectMoves * 1.2) moveScore = 4;
            if (moves > perfectMoves * 1.5) moveScore = 3;
            if (moves > perfectMoves * 2) moveScore = 2;
            if (moves > perfectMoves * 3) moveScore = 1;
            
            let timeScore = 3;
            if (time > perfectTime * 1.5) timeScore = 2;
            if (time > perfectTime * 2) timeScore = 1;
            if (time > perfectTime * 3) timeScore = 0;
            
            let comboScore = Math.min(maxCombo / totalPairs * 2, 2);
            
            const finalScore = Math.round(moveScore + timeScore + comboScore);
            return Math.min(finalScore, 10);
        }

        function displayGameRating(score) {
            const ratingDiv = document.getElementById('gameRating');
            const messageDiv = document.getElementById('ratingMessage');
            
            let currentScore = 0;
            const interval = setInterval(() => {
                currentScore++;
                ratingDiv.textContent = currentScore + '/10';
                if (currentScore >= score) {
                    clearInterval(interval);
                }
            }, 100);
            
            let message = '';
            if (score >= 9) message = '🏆 Legendary! Perfect Performance!';
            else if (score >= 8) message = '🌟 Excellent! Keep it up!';
            else if (score >= 7) message = '✨ Great! Strong Performance!';
            else if (score >= 6) message = '👍 Very Good! You can improve!';
            else if (score >= 5) message = '😊 Good! Keep practicing!';
            else message = '💪 Try again for better!';
            
            setTimeout(() => {
                messageDiv.textContent = message;
            }, 1500);
        }

        function restartGame() {
            clearInterval(timerInterval);
            document.getElementById('winScreen').style.display = 'none';
            document.getElementById('startScreen').classList.remove('hidden');
        }

        function playSound(type) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                if (type === 'flip') {
                    oscillator.frequency.value = 400;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.1);
                } else if (type === 'match') {
                    oscillator.frequency.value = 600;
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } else if (type === 'win') {
                    [523, 659, 784].forEach((freq, i) => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.15);
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                        osc.start(audioContext.currentTime + i * 0.15);
                        osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
                    });
                }
            } catch (e) {
                console.log('Audio not supported');
            }
        }