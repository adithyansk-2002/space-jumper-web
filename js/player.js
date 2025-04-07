class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.facingRight = true;
        this.keys = {
            left: false,
            right: false
        };
        this.powerups = {
            doubleJump: false,
            speedBoost: false,
            invincible: false
        };
        this.invincibleTimer = 0;
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
    }
    
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 30;
        this.velocityX = 0;
        this.velocityY = 0;
        this.jumping = false;
        this.invincibleTimer = 60; // 1 second of invincibility
    }
    
    update(platforms) {
        // Handle movement
        if (this.keys.left) {
            this.velocityX = -5;
            this.facingRight = false;
        } else if (this.keys.right) {
            this.velocityX = 5;
            this.facingRight = true;
        } else {
            this.velocityX *= 0.8; // Friction
        }
        
        // Apply speed boost if active
        if (this.powerups.speedBoost) {
            this.velocityX *= 1.5;
        }
        
        // Apply gravity
        this.velocityY += 0.5;
        
        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Keep player on screen horizontally
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        
        // Platform collision
        for (const platform of platforms) {
            if (this.velocityY > 0 && 
                this.x + this.width > platform.x &&
                this.x < platform.x + platform.width &&
                this.y + this.height > platform.y &&
                this.y < platform.y + platform.height) {
                this.y = platform.y - this.height;
                this.velocityY = 0;
                this.jumping = false;
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
        ctx.fillStyle = '#00ff00';
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
        
        ctx.restore();
    }
} 