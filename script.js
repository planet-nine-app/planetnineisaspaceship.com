import { Monitor } from './monitor.js';
import { Surface } from './surface.js';
import { SVGTextureLoader } from './svg-texture-loader.js';

class PlanetNineSpaceship {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.sphere = null;
        this.monitor = null;
        this.surface = null;
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }

    init() {
        this.setupScene();
        this.createSphere();
        this.setupLighting();
        this.setupControls();
        this.animate();
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        document.getElementById('container').appendChild(this.renderer.domElement);
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    createSphere() {
        const geometry = new THREE.SphereGeometry(2, 64, 64);

        // Load SVG texture and apply to sphere
        SVGTextureLoader.loadSVGTexture('./texture.svg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;

            const sphereMaterial = new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 100,
                reflectivity: 0.8
            });

            this.sphere.material = sphereMaterial;
        });

        // Start with a basic material while texture loads
        const tempMaterial = new THREE.MeshPhongMaterial({
            color: 0x004d00,
            shininess: 30
        });

        this.sphere = new THREE.Mesh(geometry, tempMaterial);
        this.scene.add(this.sphere);

        this.monitor = new Monitor(this.sphere, this.scene);
        this.surface = new Surface(this.sphere);
    }


    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Main directional light from the front
        const mainLight = new THREE.DirectionalLight(0xffffff, 1);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);
        
        // Secondary light from the side for better sphere definition
        const sideLight = new THREE.DirectionalLight(0x404040, 0.5);
        sideLight.position.set(-5, 0, 2);
        this.scene.add(sideLight);
        
        // Green light for text side
        const textLight = new THREE.PointLight(0x00ff00, 0.3, 10);
        textLight.position.set(0, 0, 4);
        this.scene.add(textLight);
    }

    setupControls() {
        const container = document.getElementById('container');
        
        // Mouse events
        container.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        container.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown) return;
            
            const deltaX = e.clientX - this.mouseX;
            const deltaY = e.clientY - this.mouseY;
            
            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;
            
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        
        container.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
            this.handleClick(e);
        });
        
        // Touch events for mobile
        container.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.isMouseDown = true;
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        });
        
        container.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isMouseDown) return;
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - this.mouseX;
            const deltaY = touch.clientY - this.mouseY;
            
            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;
            
            this.mouseX = touch.clientX;
            this.mouseY = touch.clientY;
        });
        
        container.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isMouseDown = false;
            this.handleTouch(e);
        });
        
        // Mouse wheel zoom
        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.1;
            const minDistance = 2;
            const maxDistance = 10;
            
            this.camera.position.z += e.deltaY * zoomSpeed * 0.01;
            this.camera.position.z = Math.max(minDistance, Math.min(maxDistance, this.camera.position.z));
        });
    }

    handleClick(e) {
        // Get canvas bounds for accurate coordinates
        const canvas = this.renderer.domElement;
        const rect = canvas.getBoundingClientRect();
        
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        
        this.checkIntersections();
    }
    
    handleTouch(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const touch = e.changedTouches[0];
            const canvas = this.renderer.domElement;
            const rect = canvas.getBoundingClientRect();
            
            this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            
            this.checkIntersections();
        }
    }
    
    checkIntersections() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const continents = this.surface.getContinents();
        const intersectableObjects = continents.map(cont => cont.continent);

        const intersects = this.raycaster.intersectObjects(intersectableObjects);

        if (intersects.length > 0) {
            const intersectedObject = intersects[0].object;
            if (intersectedObject.userData.isContinent) {
                const continentUrl = intersectedObject.userData.continentUrl;
                if (continentUrl) {
                    window.open(continentUrl, '_blank');
                }
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Smooth rotation interpolation
        this.rotationX += (this.targetRotationX - this.rotationX) * 0.1;
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.1;
        
        // Apply rotation to main sphere and its children (including text and continents)
        if (this.sphere) {
            this.sphere.rotation.x = this.rotationX;
            this.sphere.rotation.y = this.rotationY;
        }
        
        // Update monitor rotation
        if (this.monitor) {
            this.monitor.updateRotation(this.rotationX, this.rotationY);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when page loads
window.addEventListener('load', () => {
    new PlanetNineSpaceship();
});