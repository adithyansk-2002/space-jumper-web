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
        const types = ['doubleJump', 'speedBoost', 'invincible'];
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
            case 'speedBoost':
                this.drawSpeedBoost(ctx);
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
        ctx.moveTo(-10, 0);
        ctx.lineTo(-20, -10);
        ctx.lineTo(-10, -20);
        ctx.lineTo(0, -10);
        ctx.moveTo(10, 0);
        ctx.lineTo(20, -10);
        ctx.lineTo(10, -20);
        ctx.lineTo(0, -10);
        ctx.fill();
        // Draw center
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawSpeedBoost(ctx) {
        ctx.fillStyle = '#ff00ff';
        // Draw lightning bolt
        ctx.beginPath();
        ctx.moveTo(-8, -10);
        ctx.lineTo(0, 10);
        ctx.lineTo(8, -10);
        ctx.lineTo(-8, -10);
        ctx.fill();
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
            case 'speedBoost':
                return '#ff00ff';
            case 'invincible':
                return '#ffff00';
        }
    }
    
    apply(player) {
        this.collected = true;
        player.powerups[this.type] = true;
        
        // Play powerup sound
        const sound = new Audio('sounds/powerup.mp3');
        sound.play().catch(() => {}); // Ignore errors if sound fails to play
        
        // Remove powerup after duration
        setTimeout(() => {
            player.powerups[this.type] = false;
        }, this.duration * 1000 / 60);
    }
} 