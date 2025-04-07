class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 30;
        this.type = type; // basic, flying, bouncing
        this.velocityX = type === 'basic' ? 2 : 0;
        this.velocityY = 0;
        this.direction = 1;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.bounceHeight = -10;
        this.moveRange = 100;
        this.originalX = x;
    }
    
    update() {
        this.animationFrame += this.animationSpeed;
        
        switch (this.type) {
            case 'basic':
                // Move back and forth
                this.x += this.velocityX * this.direction;
                if (this.x > this.originalX + this.moveRange || 
                    this.x < this.originalX - this.moveRange) {
                    this.direction *= -1;
                }
                break;
                
            case 'flying':
                // Fly in a sine wave pattern
                this.x += 2;
                this.y += Math.sin(this.animationFrame) * 2;
                if (this.x > canvas.width) {
                    this.x = -this.width;
                }
                break;
                
            case 'bouncing':
                // Bounce up and down
                this.velocityY += 0.5;
                this.y += this.velocityY;
                if (this.y > canvas.height - this.height) {
                    this.y = canvas.height - this.height;
                    this.velocityY = this.bounceHeight;
                }
                break;
        }
    }
    
    draw(ctx, scrollY) {
        ctx.save();
        
        // Draw enemy body
        switch (this.type) {
            case 'basic':
                ctx.fillStyle = '#ff0000';
                break;
            case 'flying':
                ctx.fillStyle = '#ff00ff';
                break;
            case 'bouncing':
                ctx.fillStyle = '#ff6600';
                break;
        }
        
        // Draw enemy with animation
        const frame = Math.floor(this.animationFrame) % 4;
        const scale = 1 + (frame === 1 || frame === 3 ? 0.1 : 0);
        
        ctx.translate(this.x + this.width/2, this.y - scrollY + this.height/2);
        ctx.scale(scale, scale);
        
        // Draw enemy shape
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemy eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-5, -5, 3, 0, Math.PI * 2);
        ctx.arc(5, -5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemy pupils
        ctx.fillStyle = '#000';
        const lookX = this.type === 'basic' ? (this.direction * 2) : 0;
        ctx.beginPath();
        ctx.arc(-5 + lookX, -5, 1.5, 0, Math.PI * 2);
        ctx.arc(5 + lookX, -5, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw enemy mouth
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 5, 5, 0, Math.PI);
        ctx.stroke();
        
        ctx.restore();
    }
} 