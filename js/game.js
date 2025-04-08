class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver, win
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        this.powerups = [];
        this.gameSpeed = 1;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.highestPlatformY = 0; // Track highest platform reached
        this.playerName = '';
        this.highscores = this.loadHighscores();
        
        // Game constants
        this.GRAVITY = 0.15;
        this.JUMP_STRENGTH = -7;
        this.PLATFORM_SPEED = 1.5;
        this.SCROLL_THRESHOLD = 300;
        
        // Generate level first to get platform positions
        this.generateLevel();
        
        // Initialize player on the first platform
        const firstPlatform = this.platforms[0];
        this.player = new Player();
        this.player.x = firstPlatform.x + firstPlatform.width / 2 - this.player.width / 2; // Center on platform
        this.player.y = firstPlatform.y - this.player.height; // On top of platform
        this.player.velocityY = 0; // Start with no vertical velocity
        this.player.jumping = false; // Not jumping initially
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial draw
        this.draw();
    }
    
    setupEventListeners() {
        // Game state buttons
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        
        // Movement controls
        window.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.player.keys.left = true;
                    break;
                case 'ArrowRight':
                    this.player.keys.right = true;
                    break;
                case 'ArrowUp':
                    if (!this.player.jumping) {
                        this.player.velocityY = this.JUMP_STRENGTH;
                        this.player.jumping = true;
                    }
                    this.player.keys.up = true;
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                    this.player.keys.left = false;
                    break;
                case 'ArrowRight':
                    this.player.keys.right = false;
                    break;
                case 'ArrowUp':
                    this.player.keys.up = false;
                    break;
            }
        });

        // High scores button
        document.getElementById('highscoresButton').addEventListener('click', () => {
            this.showHighscores();
        });

        // Back to menu button
        document.getElementById('backToMenuButton').addEventListener('click', () => {
            this.showMenu();
        });

        // Main Menu button in game over screen
        document.getElementById('mainMenuButton').addEventListener('click', () => {
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('menuScreen').classList.remove('hidden');
            this.gameState = 'menu';
        });
    }
    
    startGame() {
        const nameInput = document.getElementById('playerName');
        this.playerName = nameInput.value.trim() || 'Player';
        
        // Store player name in localStorage
        localStorage.setItem('lastPlayerName', this.playerName);
        
        this.gameState = 'playing';
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        this.gameLoop();
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.scrollY = 0;
        this.maxScrollY = 0;
        this.highestPlatformY = 0; // Reset highest platform
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        this.powerups = [];
        this.player.reset();
        this.generateLevel();
        this.gameState = 'playing';
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
    }
    
    generateLevel() {
        // Clear existing platforms
        this.platforms = [];
        this.stars = [];
        this.enemies = [];
        
        // Generate initial platforms
        let currentY = this.canvas.height - 100;
        
        // First platform is always normal and centered
        this.platforms.push(new Platform(
            this.canvas.width / 2 - 100,
            currentY,
            200,
            20,
            'normal'
        ));
        
        // Generate initial set of platforms with consistent spacing
        for (let i = 0; i < 2; i++) { // Reduced from 3 to 2
            currentY -= 50; // Consistent 50 pixel spacing for all platforms
            this.generatePlatformRow(currentY);
        }
    }
    
    generatePlatformRow(y) {
        const platformTypes = ['normal', 'moving', 'disappearing'];
        const lastPlatform = this.platforms[this.platforms.length - 1];
        const lastX = lastPlatform ? lastPlatform.x + lastPlatform.width / 2 : this.canvas.width / 2;
        
        // Check how many platforms are at this y-level
        const platformsAtThisLevel = this.platforms.filter(p => p.y === y).length;
        if (platformsAtThisLevel >= 2) return; // Don't generate more than 2 platforms per y-level
        
        // Generate only 1 platform in a row
        const platformCount = 1;
        
        for (let i = 0; i < platformCount; i++) {
            const typeIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * platformTypes.length);
            const type = platformTypes[typeIndex];
            
            // Calculate x position with more variation but within screen bounds
            const minDistance = 500; // Increased from 200
            const maxDistance = 600; // Increased from 400
            const randomDistance = Math.random() * (maxDistance - minDistance) + minDistance;
            const direction = Math.random() < 0.5 ? -1 : 1; // Random direction (left or right)
            
            // Calculate new x position ensuring it stays within canvas bounds
            let x = lastX + (randomDistance * direction);
            // Ensure platform stays within screen with margin
            const margin = 150; // Margin from screen edges
            x = Math.max(margin, Math.min(this.canvas.width - margin - 200, x));
            
            this.platforms.push(new Platform(
                x,
                y,
                200,
                20,
                type
            ));
            
            // Add stars with 30% chance per platform
            if (Math.random() < 0.3) {
                this.stars.push(new Star(
                    x + Math.random() * 200,
                    y - 30
                ));
            }
            
            // Add enemies with 20% chance per platform
            if (Math.random() < 0.2) {
                this.enemies.push(new Enemy(
                    x + Math.random() * 200,
                    y - 30,
                    ['basic', 'flying', 'bouncing'][Math.floor(Math.random() * 3)]
                ));
            }

            // Add powerups with 15% chance per platform
            if (Math.random() < 0.15) {
                this.powerups.push(new Powerup(
                    x + Math.random() * 200,
                    y - 30
                ));
            }
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(this.platforms);
        
        // Update platforms
        this.platforms.forEach(platform => platform.update());
        
        // Update stars
        this.stars.forEach(star => star.update());
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update(this.platforms));
        
        // Update powerups
        this.powerups.forEach(powerup => powerup.update());
        
        // Check collisions
        this.checkCollisions();
        
        // Only scroll and generate platforms if player is not respawning
        if (this.player.invincibleTimer <= 0) {
            // Scroll view if player is high enough
            if (this.player.y < this.SCROLL_THRESHOLD) {
                this.scrollY = this.player.y - this.SCROLL_THRESHOLD;
                this.maxScrollY = Math.min(this.maxScrollY, this.scrollY);
                
                // Update highest platform reached
                this.highestPlatformY = Math.min(this.highestPlatformY, this.player.y);
                
                // Generate new platforms when player is high enough
                this.generateNewPlatforms();
            }
        }
        
        // Check if player fell off screen
        if (this.player.y > this.canvas.height + 100) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                // Find the highest platform above the player's highest reached position
                const respawnPlatform = this.platforms
                    .filter(p => p.y <= this.highestPlatformY)
                    .sort((a, b) => a.y - b.y)[0];
                
                if (respawnPlatform) {
                    // Respawn on the highest platform
                    this.player.x = respawnPlatform.x + respawnPlatform.width / 2;
                    this.player.y = respawnPlatform.y - 30;
                } else {
                    // Fallback to first platform if no higher platform found
                    const firstPlatform = this.platforms[0];
                    this.player.x = firstPlatform.x + firstPlatform.width / 2;
                    this.player.y = firstPlatform.y - 30;
                }
                
                this.player.velocityY = 0;
                this.player.velocityX = 0;
                this.player.jumping = false;
                this.player.invincibleTimer = 180; // 3 seconds of invincibility
            }
        }
    }
    
    generateNewPlatforms() {
        // Don't generate or clean up anything if player is respawning
        if (this.player.invincibleTimer > 0) {
            return;
        }

        // Keep only platforms that are within view and visible
        const viewBottom = this.scrollY + this.canvas.height;
        const viewTop = this.scrollY;
        
        // Filter out platforms that are too far below or have disappeared
        this.platforms = this.platforms.filter(platform => {
            const isInView = platform.y > viewTop - 100 && platform.y < viewBottom + 100;
            return platform.visible && isInView;
        });
        
        // Generate new platforms if needed
        const highestPlatform = Math.min(...this.platforms.map(p => p.y));
        
        // Generate new platforms when player is near the top platform
        if (this.player.y < highestPlatform + 200) {
            const newY = highestPlatform - 50; // Consistent 50 pixel spacing
            this.generatePlatformRow(newY);
        }
    }
    
    checkCollisions() {
        // Check player-enemy collisions
        this.enemies.forEach(enemy => {
            if (this.player.checkCollision(enemy) && !this.player.invincible) {
                this.player.takeDamage();
                if (this.player.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // Check player-star collisions
        this.stars.forEach((star, index) => {
            if (this.player.checkCollision(star)) {
                this.score += 10;
                this.stars.splice(index, 1);
                if (this.sounds && this.sounds.collect) {
                    this.sounds.collect.play();
                }
            }
        });

        // Check player-powerup collisions
        this.powerups.forEach((powerup, index) => {
            if (this.player.checkCollision(powerup)) {
                powerup.apply(this.player);
                this.powerups.splice(index, 1);
            }
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw stars
        this.ctx.fillStyle = 'white';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * this.canvas.width;
            const y = (Math.random() * this.canvas.height + this.scrollY) % this.canvas.height;
            const size = Math.random() * 2;
            this.ctx.fillRect(x, y, size, size);
        }
        
        // Draw platforms
        this.platforms.forEach(platform => {
            const drawY = platform.y - this.scrollY;
            if (drawY > -50 && drawY < this.canvas.height + 50) {
                platform.draw(this.ctx, this.scrollY);
            }
        });
        
        // Draw stars
        this.stars.forEach(star => {
            const drawY = star.y - this.scrollY;
            if (drawY > -50 && drawY < this.canvas.height + 50) {
                star.draw(this.ctx, this.scrollY);
            }
        });
        
        // Draw enemies
        this.enemies.forEach(enemy => {
            const drawY = enemy.y - this.scrollY;
            if (drawY > -50 && drawY < this.canvas.height + 50) {
                enemy.draw(this.ctx, this.scrollY);
            }
        });
        
        // Draw powerups
        this.powerups.forEach(powerup => {
            const drawY = powerup.y - this.scrollY;
            if (drawY > -50 && drawY < this.canvas.height + 50) {
                powerup.draw(this.ctx, this.scrollY);
            }
        });
        
        // Draw player
        this.player.draw(this.ctx, this.scrollY);
        
        // Draw HUD
        this.drawHUD();
    }
    
    drawHUD() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        // Draw score and lives
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        ctx.fillText(`Lives: ${this.player.lives}`, 10, 60);
        
        // Draw powerup timers
        const powerupY = 90;
        const powerupSpacing = 30;
        
        // Double Jump Timer
        if (this.player.powerups.doubleJump) {
            ctx.fillStyle = 'cyan';
            ctx.fillText('Double Jump', 10, powerupY);
            const timerWidth = (this.player.powerupTimers.doubleJump / 300) * 100;
            ctx.fillRect(10, powerupY + 10, timerWidth, 10);
        }
        
        // Speed Boost Timer
        if (this.player.powerups.speedBoost) {
            ctx.fillStyle = 'magenta';
            ctx.fillText('Speed Boost', 10, powerupY + powerupSpacing);
            const timerWidth = (this.player.powerupTimers.speedBoost / 300) * 100;
            ctx.fillRect(10, powerupY + powerupSpacing + 10, timerWidth, 10);
        }
        
        // Invincibility Timer
        if (this.player.powerups.invincible) {
            ctx.fillStyle = 'yellow';
            ctx.fillText('Invincible', 10, powerupY + powerupSpacing * 2);
            const timerWidth = (this.player.powerupTimers.invincible / 300) * 100;
            ctx.fillRect(10, powerupY + powerupSpacing * 2 + 10, timerWidth, 10);
        }
    }
    
    showHighscores() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('highscoresScreen').classList.remove('hidden');
        this.displayHighscores();
    }

    showMenu() {
        document.getElementById('highscoresScreen').classList.add('hidden');
        document.getElementById('menuScreen').classList.remove('hidden');
        
        // Load last used player name
        const lastPlayerName = localStorage.getItem('lastPlayerName');
        if (lastPlayerName) {
            document.getElementById('playerName').value = lastPlayerName;
        }
    }

    loadHighscores() {
        const highscores = localStorage.getItem('highscores');
        return highscores ? JSON.parse(highscores) : [];
    }

    saveHighscore() {
        if (this.score > 0) {
            this.highscores.push({
                name: this.playerName,
                score: this.score,
                date: new Date().toISOString()
            });
            
            // Sort by score (descending) and keep top 10
            this.highscores.sort((a, b) => b.score - a.score);
            this.highscores = this.highscores.slice(0, 10);
            
            localStorage.setItem('highscores', JSON.stringify(this.highscores));
        }
    }

    displayHighscores() {
        const highscoresList = document.getElementById('highscoresList');
        highscoresList.innerHTML = '';
        
        this.highscores.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'highscore-entry';
            div.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="name">${entry.name}</span>
                <span class="score">${entry.score}</span>
            `;
            highscoresList.appendChild(div);
        });
    }

    gameOver() {
        this.saveHighscore();
        this.gameState = 'gameOver';
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `Final Score: ${this.score}`;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
} 