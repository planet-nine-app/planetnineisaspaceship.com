export class Monitor {
    constructor(sphere, scene) {
        this.sphere = sphere;
        this.scene = scene;
        this.screenOverlay = null;
        this.textMesh = null;
        this.textCanvas = null;
        this.textContext = null;
        this.textTexture = null;

        // Multiple lines of text
        this.textLines = [
            "Hello Humans",
            "We need to talk. You are on a bit of a precipice. We would like to party with you, but it is hard to trust you will do the four things.",
            "This is an offering from The Advancement. How you use it is up to you.",
            "But 👽 believe in you 🙂"
        ];

        // Track display state for each line
        this.displayLines = ["", "", "", ""];
        this.typewriterIndex = 0;

        this.init();
    }
    
    init() {
        this.createScreenOverlay();
        this.createTextCanvas();
        this.startTypewriter();
    }
    
    createScreenOverlay() {
        const screenGeometry = new THREE.SphereGeometry(2.01, 32, 32, 0, Math.PI);
        const screenMaterial = new THREE.MeshPhongMaterial({
            color: 0x111111,
            shininess: 100,
            reflectivity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        
        this.screenOverlay = new THREE.Mesh(screenGeometry, screenMaterial);
        this.scene.add(this.screenOverlay);
    }
    
    createTextCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        this.textCanvas = canvas;
        this.textContext = ctx;

        this.textTexture = new THREE.CanvasTexture(canvas);

        const textMaterial = new THREE.MeshBasicMaterial({
            map: this.textTexture,
            transparent: true,
            opacity: 0.9
        });

        const textGeometry = new THREE.PlaneGeometry(2, 2);
        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.set(0, 0, 2.05);

        this.sphere.add(this.textMesh);
    }
    
    updateTextCanvas() {
        const ctx = this.textContext;
        const canvas = this.textCanvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 48px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 15;

        const lineHeight = 50;
        const maxWidth = canvas.width - 100; // Padding on sides
        let currentY = canvas.height / 2 - 300; // Start position for first line (moved up)

        // Render each line with word wrapping and custom spacing
        this.displayLines.forEach((line, index) => {
            if (line.length > 0) {
                const wrappedLines = this.wrapText(ctx, line, maxWidth);
                wrappedLines.forEach(wrappedLine => {
                    ctx.fillText(wrappedLine, canvas.width / 2, currentY);
                    currentY += lineHeight;
                });
            }

            // Custom spacing between sections
            if (index === 0) {
                // Extra space after first line
                currentY += lineHeight * 1.5;
            } else if (index === 1) {
                // Normal space after second line
                currentY += lineHeight * 1.5;
            } else if (index === 2) {
                // Extra space before last line (moved down more)
                currentY += lineHeight * 1.5;
            }
        });

        this.textTexture.needsUpdate = true;
    }

    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const metrics = ctx.measureText(testLine);

            if (metrics.width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }
    
    startTypewriter() {
        // Find the longest text to know when to stop
        const maxLength = Math.max(...this.textLines.map(line => line.length));

        const typeInterval = setInterval(() => {
            if (this.typewriterIndex < maxLength) {
                // Update each line simultaneously
                this.textLines.forEach((line, index) => {
                    if (this.typewriterIndex < line.length) {
                        this.displayLines[index] = line.substring(0, this.typewriterIndex + 1);
                    }
                });

                this.typewriterIndex++;
                this.updateTextCanvas();
            } else {
                clearInterval(typeInterval);
            }
        }, 50); // Speed of typing (milliseconds per character)
    }
    
    updateRotation(rotationX, rotationY) {
        if (this.screenOverlay) {
            this.screenOverlay.rotation.x = rotationX;
            this.screenOverlay.rotation.y = rotationY;
        }
    }
}
