class Star {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 20;
        this.collected = false;
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.pulseSize = 1;
        this.pulseSpeed = 0.05;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
    }
    
    collect() {
        this.collected = true;
        // Play collection sound
        const sound = new Audio('sounds/collect.mp3');
        sound.play().catch(() => {}); // Ignore errors if sound fails to play
    }
    
    update() {
        if (this.collected) return;
        
        // Update animation
        this.animationFrame += this.animationSpeed;
        this.pulseSize = 1 + Math.sin(this.animationFrame) * 0.2;
        this.rotation += this.rotationSpeed;
    }
    
    draw(ctx, scrollY) {
        if (this.collected) return;
        
        ctx.save();
        
        // Draw star with animation
        ctx.translate(this.x + this.width/2, this.y - scrollY + this.height/2);
        ctx.rotate(this.rotation);
        ctx.scale(this.pulseSize, this.pulseSize);
        
        // Draw star shape
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const x = Math.cos(angle) * 10;
            const y = Math.sin(angle) * 10;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        // Draw star glow
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        // Draw star center
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
} 