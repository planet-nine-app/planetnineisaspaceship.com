export class Surface {
    constructor(sphere) {
        this.sphere = sphere;
        this.continents = [];

        this.init();
    }

    init() {
        this.createClickableContinents();
    }

    createClickableContinents() {
        // Button positions matching the SVG texture layout on the purple side
        const buttonData = [
            {
                name: 'App Store',
                url: 'https://testflight.apple.com/join/zEZEJTqa',
                lat: 25,
                lon: 180,
                size: 0.5
            },
            {
                name: 'Play Store',
                url: 'mailto:zach@the-advancement.com',
                lat: -5,
                lon: 180,
                size: 0.5
            },
            {
                name: 'Browser',
                url: 'https://app.planetnine.app',
                lat: -35,
                lon: 180,
                size: 0.5
            }
        ];

        buttonData.forEach(button => {
            this.createClickableContinent(button);
        });
    }

    createClickableContinent(continent) {
        // Convert lat/lon to 3D position on sphere
        const phi = (90 - continent.lat) * (Math.PI / 180);
        const theta = (continent.lon) * (Math.PI / 180);

        const radius = 2.02; // Slightly above sphere surface
        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = -radius * Math.sin(phi) * Math.sin(theta);

        // Create invisible clickable plane
        const size = continent.size || 0.5;
        const continentGeometry = new THREE.CircleGeometry(size, 16);
        const continentMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });

        const continentMesh = new THREE.Mesh(continentGeometry, continentMaterial);
        continentMesh.position.set(x, y, z);

        // Orient the mesh to face outward from sphere
        const normal = new THREE.Vector3(x, y, z).normalize();
        continentMesh.lookAt(
            continentMesh.position.x + normal.x,
            continentMesh.position.y + normal.y,
            continentMesh.position.z + normal.z
        );

        this.sphere.add(continentMesh);
        continentMesh.userData.isContinent = true;
        continentMesh.userData.continentName = continent.name;
        continentMesh.userData.continentUrl = continent.url;

        this.continents.push({
            continent: continentMesh,
            data: continent
        });
    }

    getContinents() {
        return this.continents;
    }
}