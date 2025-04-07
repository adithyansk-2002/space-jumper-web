class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // normal, moving, disappearing, bouncy
        this.originalX = x;
        this.movementRange = 100;
        this.movementSpeed = 1;
        this.movementDirection = 1;
        this.disappearTimer = 0;
        this.bounceStrength = -15;
    }
    
    update() {
        switch (this.type) {
            case 'moving':
                this.x += this.movementSpeed * this.movementDirection;
                if (this.x > this.originalX + this.movementRange || 
                    this.x < this.originalX - this.movementRange) {
                    this.movementDirection *= -1;
                }
                break;
                
            case 'disappearing':
                if (this.disappearTimer > 0) {
                    this.disappearTimer--;
                    if (this.disappearTimer === 0) {
                        this.height = 0;
                    }
                }
                break;
        }
    }
    
    draw(ctx, scrollY) {
        if (this.height === 0) return;
        
        ctx.save();
        
        switch (this.type) {
            case 'normal':
                ctx.fillStyle = '#4a4a4a';
                break;
            case 'moving':
                ctx.fillStyle = '#ff6b6b';
                break;
            case 'disappearing':
                ctx.fillStyle = '#ffcc00';
                if (this.disappearTimer > 0) {
                    ctx.globalAlpha = 0.5 + (this.disappearTimer / 60) * 0.5;
                }
                break;
            case 'bouncy':
                ctx.fillStyle = '#00ff00';
                break;
        }
        
        // Draw platform
        ctx.fillRect(this.x, this.y - scrollY, this.width, this.height);
        
        // Draw platform details
        ctx.fillStyle = '#fff';
        for (let i = 0; i < this.width; i += 20) {
            ctx.fillRect(this.x + i, this.y - scrollY, 10, 2);
        }
        
        ctx.restore();
    }
    
    trigger() {
        if (this.type === 'disappearing') {
            this.disappearTimer = 60; // 1 second before disappearing
        }
    }
    
    getBounceStrength() {
        return this.type === 'bouncy' ? this.bounceStrength : 0;
    }
} 