export class Monitor {
    constructor(sphere, scene) {
        this.sphere = sphere;
        this.scene = scene;
        this.screenOverlay = null;
        this.textMesh = null;
        this.textCanvas = null;
        this.textContext = null;
        this.textTexture = null;
        
        this.typewriterText = "Hello World";
        this.typewriterIndex = 0;
        this.typewriterDisplay = "";
        
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
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        this.textCanvas = canvas;
        this.textContext = ctx;
        
        this.textTexture = new THREE.CanvasTexture(canvas);
        
        const textMaterial = new THREE.MeshBasicMaterial({
            map: this.textTexture,
            transparent: true,
            opacity: 0.9
        });
        
        const textGeometry = new THREE.PlaneGeometry(1.5, 1.5);
        this.textMesh = new THREE.Mesh(textGeometry, textMaterial);
        this.textMesh.position.set(0, 0, 2.1);
        
        this.sphere.add(this.textMesh);
    }
    
    updateTextCanvas() {
        const ctx = this.textContext;
        const canvas = this.textCanvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 32px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10;
        
        ctx.fillText(this.typewriterDisplay + '█', canvas.width / 2, canvas.height / 2);
        
        this.textTexture.needsUpdate = true;
    }
    
    startTypewriter() {
        const typeInterval = setInterval(() => {
            if (this.typewriterIndex < this.typewriterText.length) {
                this.typewriterDisplay += this.typewriterText[this.typewriterIndex];
                this.typewriterIndex++;
                this.updateTextCanvas();
            } else {
                clearInterval(typeInterval);
                setTimeout(() => {
                    this.typewriterDisplay = this.typewriterText;
                    this.updateTextCanvas();
                }, 1000);
            }
        }, 100);
    }
    
    updateRotation(rotationX, rotationY) {
        if (this.screenOverlay) {
            this.screenOverlay.rotation.x = rotationX;
            this.screenOverlay.rotation.y = rotationY;
        }
    }
}