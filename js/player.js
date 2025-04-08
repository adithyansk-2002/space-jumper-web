class Player {
    constructor() {
        const canvas = document.getElementById('gameCanvas');
        this.x = canvas.width / 2; // Start in the center
        this.y = canvas.height - 30; // Start near the bottom
        this.width = 30;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.canDoubleJump = false;
        this.lives = 3;
        this.score = 0;
        this.invincibleTimer = 0;
        this.powerups = {
            doubleJump: false,
            teleport: false,
            speedBoost: false,
            invincible: false
        };
        this.powerupTimers = {
            doubleJump: 0,
            teleport: 0,
            speedBoost: 0,
            invincible: 0
        };
        this.canPassThrough = false;
        this.keys = {
            left: false,
            right: false,
            up: false
        };
        
        // Load sounds
        this.sounds = {
            jump: new Audio('sounds/jump.mp3'),
            hit: new Audio('sounds/hit.mp3'),
            collect: new Audio('sounds/collect.mp3')
        };
        
        // Set volume
        this.sounds.jump.volume = 0.5;
        this.sounds.hit.volume = 0.5;
        this.sounds.collect.volume = 0.5;
        
        // Constants
        this.JUMP_STRENGTH = -15; // Increased from -12 to -15 for higher jumps
        this.GRAVITY = 0.3; // Reduced from 0.5 to 0.3 for slower fall
        this.MOVE_SPEED = 5;
        this.AIR_CONTROL = 0.85;
    }
    
    reset() {
        const canvas = document.getElementById('gameCanvas');
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.invincibleTimer = 0;
        this.lives = 3;
        this.canPassThrough = false;
        
        // Reset all powerups and their timers
        this.powerups = {
            doubleJump: false,
            teleport: false,
            speedBoost: false,
            invincible: false
        };
        this.powerupTimers = {
            doubleJump: 0,
            teleport: 0,
            speedBoost: 0,
            invincible: 0
        };
    }
    
    update(platforms) {
        // Handle movement with more controlled acceleration
        const airControlFactor = this.jumping ? 0.85 : 1;
        
        if (this.keys.left) {
            this.velocityX = Math.max(this.velocityX - 0.5 * airControlFactor, -4 * airControlFactor);
            this.facingRight = false;
        } else if (this.keys.right) {
            this.velocityX = Math.min(this.velocityX + 0.5 * airControlFactor, 4 * airControlFactor);
            this.facingRight = true;
        } else {
            // Quicker stopping with higher friction
            if (this.velocityX > 0) {
                this.velocityX = Math.max(0, this.velocityX - 1);
            } else if (this.velocityX < 0) {
                this.velocityX = Math.min(0, this.velocityX + 1);
            }
        }
        
        // Handle teleport
        if (this.powerups.teleport && this.keys.up && this.teleportCooldown <= 0) {
            // Find nearest platform in the direction the player is facing
            const direction = this.facingRight ? 1 : -1;
            const nearestPlatform = platforms
                .filter(p => {
                    const xDiff = p.x - this.x;
                    return (direction > 0 ? xDiff > 0 : xDiff < 0) && // Platform is in front of player
                           Math.abs(p.y - this.y) < 200; // Platform is within vertical range
                })
                .sort((a, b) => {
                    // Sort by distance, prioritizing horizontal distance
                    const distA = Math.abs(a.x - this.x) + Math.abs(a.y - this.y) * 0.5;
                    const distB = Math.abs(b.x - this.x) + Math.abs(b.y - this.y) * 0.5;
                    return distA - distB;
                })[0];
            
            if (nearestPlatform) {
                // Teleport to the platform
                this.x = nearestPlatform.x + nearestPlatform.width / 2;
                this.y = nearestPlatform.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
                this.teleportCooldown = 30; // 0.5 second cooldown
            }
        }
        
        // Update cooldowns
        if (this.teleportCooldown > 0) {
            this.teleportCooldown--;
        }
        
        // Apply gravity
        this.velocityY += 0.15;
        
        // Update position first
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Keep player on screen horizontally
        const canvas = document.getElementById('gameCanvas');
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Track if player is on any platform
        let onPlatform = false;
        let currentPlatform = null;
        
        // Platform collision
        for (const platform of platforms) {
            // Check if player is colliding with platform
            if (this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {
                
                // Only handle collision if:
                // 1. Player is moving downward (velocityY > 0)
                // 2. Player's bottom is above platform's top
                // 3. Player is not trying to pass through (canPassThrough is false)
                if (this.velocityY > 0 && 
                    this.y + this.height - this.velocityY <= platform.y + 5 && // Added small buffer
                    !this.canPassThrough) {
                    this.y = platform.y - this.height;
                    this.velocityY = 0;
                    this.jumping = false;
                    this.velocityX *= 0.8; // Add friction when landing
                    
                    // Track that player is on this platform
                    onPlatform = true;
                    currentPlatform = platform;
                    
                    // Trigger disappearing platform
                    if (platform.type === 'disappearing') {
                        platform.trigger();
                    }
                    
                    // If it's a moving platform and player isn't jumping, move with it
                    if (platform.type === 'moving' && !this.jumping) {
                        // Move the player with the platform's movement
                        this.x += platform.movementSpeed * platform.movementDirection;
                    }
                }
            }
        }
        
        // If player was on a platform but isn't anymore, they're falling
        if (!onPlatform && !this.jumping) {
            this.jumping = true;
        }
        
        // Update powerup timers
        if (this.powerups.doubleJump) {
            this.powerupTimers.doubleJump--;
            if (this.powerupTimers.doubleJump <= 0) {
                this.powerups.doubleJump = false;
            }
        }
        
        if (this.powerups.teleport) {
            this.powerupTimers.teleport--;
            if (this.powerupTimers.teleport <= 0) {
                this.powerups.teleport = false;
            }
        }
        
        if (this.powerups.speedBoost) {
            this.powerupTimers.speedBoost--;
            if (this.powerupTimers.speedBoost <= 0) {
                this.powerups.speedBoost = false;
            }
        }
        
        if (this.powerups.invincible) {
            this.powerupTimers.invincible--;
            if (this.powerupTimers.invincible <= 0) {
                this.powerups.invincible = false;
            }
        }
        
        // Update animation
        if (this.velocityX !== 0) {
            this.animationFrame += this.animationSpeed;
        } else {
            this.animationFrame = 0;
        }
        
        // Update invincibility timer
        if (this.invincibleTimer > 0) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.powerups.invincible = false;
            }
        }
        
        // Reset canPassThrough if player is not moving upward
        if (this.velocityY >= 0) {
            this.canPassThrough = false;
        }
    }
    
    checkCollision(object) {
        return this.x + this.width > object.x &&
               this.x < object.x + object.width &&
               this.y + this.height > object.y &&
               this.y < object.y + object.height;
    }
    
    draw(ctx, scrollY) {
        // Draw player with animation
        ctx.save();
        
        // Apply invincibility effect
        if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Draw player body
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - scrollY, this.width, this.height);
        
        // Draw player face
        ctx.fillStyle = '#000';
        const eyeX = this.facingRight ? this.x + 20 : this.x + 10;
        ctx.fillRect(eyeX, this.y - scrollY + 10, 5, 5);
        
        // Draw animation effect
        if (this.velocityX !== 0) {
            ctx.fillStyle = '#00ff00';
            const frame = Math.floor(this.animationFrame) % 4;
            for (let i = 0; i < 3; i++) {
                if (i !== frame) {
                    const trailX = this.facingRight ? 
                        this.x - (i + 1) * 10 : 
                        this.x + this.width + (i + 1) * 10;
                    ctx.fillRect(trailX, this.y - scrollY, 5, this.height);
                }
            }
        }
        
        // Draw powerup indicators
        const indicatorSize = 10;
        const indicatorSpacing = 15;
        let indicatorCount = 0;
        
        if (this.powerups.doubleJump) {
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(this.x + this.width + indicatorSpacing, 
                   this.y - scrollY + indicatorCount * indicatorSpacing, 
                   indicatorSize, 0, Math.PI * 2);
            ctx.fill();
            indicatorCount++;
        }
        
        if (this.powerups.teleport) {
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(this.x + this.width + indicatorSpacing, 
                   this.y - scrollY + indicatorCount * indicatorSpacing, 
                   indicatorSize, 0, Math.PI * 2);
            ctx.fill();
            indicatorCount++;
        }
        
        if (this.powerups.speedBoost) {
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width + indicatorSpacing, 
                      this.y - scrollY + indicatorCount * indicatorSpacing);
            ctx.lineTo(this.x + this.width + indicatorSpacing + 10, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 10);
            ctx.lineTo(this.x + this.width + indicatorSpacing, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 20);
            ctx.closePath();
            ctx.fill();
            indicatorCount++;
        }
        
        if (this.powerups.invincible) {
            ctx.fillStyle = '#ffff00';
            ctx.beginPath();
            ctx.arc(this.x + this.width + indicatorSpacing, 
                   this.y - scrollY + indicatorCount * indicatorSpacing, 
                   indicatorSize, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw shield
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width + indicatorSpacing - 5, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 5);
            ctx.lineTo(this.x + this.width + indicatorSpacing + 5, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 15);
            ctx.moveTo(this.x + this.width + indicatorSpacing - 5, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 15);
            ctx.lineTo(this.x + this.width + indicatorSpacing + 5, 
                      this.y - scrollY + indicatorCount * indicatorSpacing + 5);
            ctx.stroke();
            indicatorCount++;
        }
        
        ctx.restore();
    }
    
    takeDamage() {
        if (this.invincibleTimer > 0) return;
        
        this.lives--;
        this.invincibleTimer = 180; // 3 seconds of invincibility
        
        // Play hit sound
        if (this.sounds && this.sounds.hit) {
            try {
                this.sounds.hit.play().catch(e => {});
            } catch (e) {}
        }
    }
    
    jump() {
        if (!this.jumping || (this.powerups.doubleJump && this.canDoubleJump)) {
            this.velocityY = this.JUMP_STRENGTH;
            this.jumping = true;
            this.canPassThrough = true; // Allow passing through platforms when jumping
            
            if (this.powerups.doubleJump && !this.canDoubleJump) {
                this.canDoubleJump = true;
            } else if (this.powerups.doubleJump) {
                this.canDoubleJump = false;
            }
            
            // Play jump sound
            if (this.sounds && this.sounds.jump) {
                try {
                    this.sounds.jump.play().catch(e => {});
                } catch (e) {}
            }
        }
    }
} 