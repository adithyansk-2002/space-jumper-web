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
        
        // Game constants
        this.GRAVITY = 0.5;
        this.JUMP_STRENGTH = -12;
        this.PLATFORM_SPEED = 2;
        this.SCROLL_THRESHOLD = 300;
        
        // Initialize game elements
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 30);
        this.generateLevel();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.getElementById('restartButton').addEventListener('click', () => this.restartGame());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.player.keys.left = true;
            if (e.key === 'ArrowRight') this.player.keys.right = true;
            if (e.key === ' ' && !this.player.jumping) {
                this.player.velocityY = this.JUMP_STRENGTH;
                this.player.jumping = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') this.player.keys.left = false;
            if (e.key === 'ArrowRight') this.player.keys.right = false;
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
        // Generate platforms
        for (let i = 0; i < 10; i++) {
            this.platforms.push(new Platform(
                Math.random() * (this.canvas.width - 200),
                i * 100 + 400,
                200,
                20
            ));
        }
        
        // Generate stars
        for (let i = 0; i < 5; i++) {
            this.stars.push(new Star(
                Math.random() * (this.canvas.width - 20),
                Math.random() * (this.canvas.height - 20)
            ));
        }
        
        // Generate enemies
        for (let i = 0; i < 3; i++) {
            this.enemies.push(new Enemy(
                Math.random() * (this.canvas.width - 30),
                Math.random() * (this.canvas.height - 30)
            ));
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // Update player
        this.player.update(this.platforms);
        
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());
        
        // Update powerups
        this.powerups.forEach(powerup => powerup.update());
        
        // Check collisions
        this.checkCollisions();
        
        // Scroll view if player is high enough
        if (this.player.y < this.SCROLL_THRESHOLD) {
            this.scrollY = this.SCROLL_THRESHOLD - this.player.y;
            this.maxScrollY = Math.max(this.maxScrollY, this.scrollY);
        }
        
        // Check if player fell off screen
        if (this.player.y > this.canvas.height + 100) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.reset();
            }
        }
    }
    
    checkCollisions() {
        // Star collisions
        this.stars.forEach((star, index) => {
            if (!star.collected && this.player.checkCollision(star)) {
                star.collect();
                this.score += 10;
                // Chance to spawn powerup
                if (Math.random() < 0.2) {
                    this.powerups.push(new Powerup(star.x, star.y));
                }
            }
        });
        
        // Enemy collisions
        this.enemies.forEach(enemy => {
            if (this.player.checkCollision(enemy)) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.player.reset();
                }
            }
        });
        
        // Powerup collisions
        this.powerups.forEach((powerup, index) => {
            if (this.player.checkCollision(powerup)) {
                powerup.apply(this.player);
                this.powerups.splice(index, 1);
            }
        });
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background stars
        this.drawBackground();
        
        // Draw platforms
        this.platforms.forEach(platform => platform.draw(this.ctx, this.scrollY));
        
        // Draw stars
        this.stars.forEach(star => star.draw(this.ctx, this.scrollY));
        
        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.scrollY));
        
        // Draw powerups
        this.powerups.forEach(powerup => powerup.draw(this.ctx, this.scrollY));
        
        // Draw player
        this.player.draw(this.ctx, this.scrollY);
        
        // Draw HUD
        this.drawHUD();
    }
    
    drawBackground() {
        // Draw space background with stars
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
    }
    
    drawHUD() {
        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px "Press Start 2P"';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
        
        // Draw lives
        this.ctx.fillText(`Lives: ${this.lives}`, 20, 60);
        
        // Draw level
        this.ctx.fillText(`Level: ${this.level}`, 20, 90);
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