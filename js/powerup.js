class Powerup {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.type = this.getRandomType();
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.collected = false;
        this.duration = 300; // 5 seconds at 60fps
    }
    
    getRandomType() {
        const types = ['doubleJump', 'teleport', 'invincible'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    update() {
        if (this.collected) return;
        
        // Float up and down
        this.animationFrame += this.animationSpeed;
        this.y += Math.sin(this.animationFrame) * 0.5;
    }
    
    draw(ctx, scrollY) {
        if (this.collected) return;
        
        ctx.save();
        
        // Draw powerup with animation
        ctx.translate(this.x + this.width/2, this.y - scrollY + this.height/2);
        
        // Draw powerup based on type
        switch (this.type) {
            case 'doubleJump':
                this.drawDoubleJump(ctx);
                break;
            case 'teleport':
                this.drawTeleport(ctx);
                break;
            case 'invincible':
                this.drawInvincible(ctx);
                break;
        }
        
        // Draw glow effect
        ctx.shadowColor = this.getPowerupColor();
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }
    
    drawDoubleJump(ctx) {
        ctx.fillStyle = '#00ffff';
        // Draw wings
        ctx.beginPath();
        ctx.arc(-8, 0, 5, 0, Math.PI * 2);
        ctx.arc(8, 0, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTeleport(ctx) {
        ctx.fillStyle = '#ff00ff';
        // Draw teleport symbol (spiral)
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI / 2;
            const radius = 8 - i * 1.5;
            ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        }
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    drawInvincible(ctx) {
        ctx.fillStyle = '#ffff00';
        // Draw shield
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        // Draw cross
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.moveTo(-5, 5);
        ctx.lineTo(5, -5);
        ctx.stroke();
    }
    
    getPowerupColor() {
        switch (this.type) {
            case 'doubleJump':
                return '#00ffff';
            case 'teleport':
                return '#ff00ff';
            case 'invincible':
                return '#ffff00';
        }
    }
    
    apply(player) {
        if (this.collected) return;
        
        this.collected = true;
        
        // Play collection sound
        const sound = new Audio('sounds/collect.mp3');
        sound.play().catch(() => {}); // Ignore errors if sound fails to play
        
        // Apply powerup effect
        switch (this.type) {
            case 'doubleJump':
                player.powerups.doubleJump = true;
                player.powerupTimers.doubleJump = this.duration;
                break;
            case 'teleport':
                player.powerups.teleport = true;
                player.powerupTimers.teleport = this.duration;
                break;
            case 'invincible':
                player.powerups.invincible = true;
                player.powerupTimers.invincible = this.duration;
                break;
        }
    }
} 