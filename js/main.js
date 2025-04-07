// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    const game = new Game();
    
    // Add touch controls for mobile
    if ('ontouchstart' in window) {
        const leftButton = document.createElement('button');
        leftButton.className = 'mobile-control left';
        leftButton.textContent = '←';
        leftButton.addEventListener('touchstart', () => game.player.keys.left = true);
        leftButton.addEventListener('touchend', () => game.player.keys.left = false);
        
        const rightButton = document.createElement('button');
        rightButton.className = 'mobile-control right';
        rightButton.textContent = '→';
        rightButton.addEventListener('touchstart', () => game.player.keys.right = true);
        rightButton.addEventListener('touchend', () => game.player.keys.right = false);
        
        const jumpButton = document.createElement('button');
        jumpButton.className = 'mobile-control jump';
        jumpButton.textContent = '↑';
        jumpButton.addEventListener('touchstart', () => {
            if (!game.player.jumping) {
                game.player.velocityY = game.JUMP_STRENGTH;
                game.player.jumping = true;
            }
        });
        
        document.body.appendChild(leftButton);
        document.body.appendChild(rightButton);
        document.body.appendChild(jumpButton);
        
        // Add mobile control styles
        const style = document.createElement('style');
        style.textContent = `
            .mobile-control {
                position: fixed;
                bottom: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.2);
                border: 2px solid #fff;
                color: #fff;
                font-size: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .mobile-control.left {
                left: 20px;
            }
            .mobile-control.right {
                left: 100px;
            }
            .mobile-control.jump {
                right: 20px;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add game instructions
    const instructions = document.createElement('div');
    instructions.className = 'game-instructions';
    instructions.innerHTML = `
        <h2>How to Play</h2>
        <p>← → : Move Left/Right</p>
        <p>↑ : Jump</p>
        <p>Collect stars to earn points!</p>
        <p>Avoid obstacles and enemies!</p>
        <p>Collect powerups for special abilities!</p>
    `;
    document.getElementById('menuScreen').appendChild(instructions);
    
    // Add game styles
    const gameStyles = document.createElement('style');
    gameStyles.textContent = `
        .game-instructions {
            margin-top: 20px;
            text-align: center;
            color: #fff;
        }
        .game-instructions h2 {
            font-size: 1.2em;
            margin-bottom: 10px;
            color: #00ff00;
        }
        .game-instructions p {
            margin: 5px 0;
            font-size: 0.8em;
        }
    `;
    document.head.appendChild(gameStyles);
    
    // Start the game when the start button is clicked
    document.getElementById('startButton').addEventListener('click', () => {
        game.startGame();
    });
    
    // Restart the game when the restart button is clicked
    document.getElementById('restartButton').addEventListener('click', () => {
        game.restartGame();
    });
}); 