class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
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
        
        // Game constants
        this.GRAVITY = 0.15;
        this.JUMP_STRENGTH = -7;
        this.PLATFORM_SPEED = 1.5;
        this.SCROLL_THRESHOLD = 300;
        
        // Generate level first to get platform positions
        this.generateLevel();
        
        // Initialize player on the first platform
        const firstPlatform = this.platforms[0];
        this.player = new Player(
            firstPlatform.x + firstPlatform.width / 2, // Center of platform
            firstPlatform.y - 30 // Above the platform
        );
        
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
    }
    
    startGame() {
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
        
        console.log('First Platform:', {
            y: currentY,
            height: this.canvas.height
        });
        
        // Generate initial set of platforms with consistent spacing
        for (let i = 0; i < 3; i++) {
            currentY -= 50; // Consistent 50 pixel spacing for all platforms
            this.generatePlatformRow(currentY);
        }
    }
    
    generatePlatformRow(y) {
        const platformTypes = ['normal', 'moving', 'disappearing', 'bouncy'];
        const lastPlatform = this.platforms[this.platforms.length - 1];
        const lastX = lastPlatform ? lastPlatform.x + lastPlatform.width / 2 : this.canvas.width / 2;
        
        // Generate only 1 platform in a row
        const platformCount = 1;
        const spacing = this.canvas.width / (platformCount + 1);
        
        for (let i = 0; i < platformCount; i++) {
            const typeIndex = Math.random() < 0.7 ? 0 : Math.floor(Math.random() * platformTypes.length);
            const type = platformTypes[typeIndex];
            
            // Calculate x position with some randomness
            const baseX = spacing * (i + 1);
            const randomOffset = (Math.random() - 0.5) * 100;
            const x = Math.max(0, Math.min(this.canvas.width - 200, baseX + randomOffset));
            
            // Use smaller vertical spacing for the first platform
            const isFirstPlatform = this.platforms.length === 0;
            const verticalSpacing = isFirstPlatform ? 50 : 100; // 50 pixels for first platform, 100 for others
            const newY = y - verticalSpacing;
            
            console.log('Platform Generation:', {
                platformNumber: this.platforms.length + 1,
                isFirstPlatform: isFirstPlatform,
                verticalSpacing: verticalSpacing,
                currentY: y,
                newY: newY,
                x: x,
                type: type
            });
            
            this.platforms.push(new Platform(
                x,
                newY,
                200,
                20,
                type
            ));
            
            // Add stars with 30% chance per platform
            if (Math.random() < 0.3) {
                this.stars.push(new Star(
                    x + Math.random() * 200,
                    newY - 30
                ));
            }
            
            // Add enemies with 20% chance per platform
            if (Math.random() < 0.2) {
                this.enemies.push(new Enemy(
                    x + Math.random() * 200,
                    newY - 30,
                    ['basic', 'flying', 'bouncing'][Math.floor(Math.random() * 3)]
                ));
            }

            // Add powerups with 15% chance per platform
            if (Math.random() < 0.15) {
                this.powerups.push(new Powerup(
                    x + Math.random() * 200,
                    newY - 30
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

        // Only generate new platforms if player is moving up
        if (this.player.velocityY >= 0) {
            return;
        }

        // Keep only platforms that are within view
        const viewBottom = this.scrollY + this.canvas.height;
        const viewTop = this.scrollY;
        
        // Generate new platforms if needed
        const highestPlatform = Math.min(...this.platforms.map(p => p.y));
        
        // Only generate new platforms at the top when needed
        if (highestPlatform > viewTop - 300) {
            const newY = highestPlatform - 50; // Consistent 50 pixel spacing
            this.generatePlatformRow(newY);
            
            console.log('Generated new platform at:', {
                y: newY,
                highestPlatform: highestPlatform,
                viewTop: viewTop
            });
        }
    }
    
    checkCollisions() {
        // Check player-enemy collisions
        this.enemies.forEach(enemy => {
            if (this.player.checkCollision(enemy) && !this.player.invincible) {
                console.log('Player hit by enemy:', {
                    playerX: this.player.x,
                    playerY: this.player.y,
                    enemyX: enemy.x,
                    enemyY: enemy.y,
                    playerLives: this.player.lives
                });
                this.player.takeDamage();
                if (this.player.lives <= 0) {
                    console.log('Game Over - Player lives depleted');
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
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = `Score: ${this.score}`;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
} 