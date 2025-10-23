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
        // Continent positions matching the SVG texture layout
        // The SVG right side spans from 1024-2048 horizontally (0-1024 vertically)
        // We need to map these to sphere coordinates on the back half

        const continentData = [
            {
                name: 'The Stack',
                url: 'https://github.com/planet-nine-app/planet-nine/blob/main/The%20Stack.md',
                // Northwestern position - left side of purple canvas
                lat: 43,
                lon: 185,
                size: 0.6
            },
            {
                name: 'allyabase',
                url: 'https://github.com/planet-nine-app/allyabase',
                // Northeastern position - right side of purple canvas
                lat: 43,
                lon: 95,
                size: 0.7
            },
            {
                name: 'The Advancement',
                url: 'https://github.com/planet-nine-app/the-advancement',
                // Southwestern position - left side of purple canvas
                lat: -22,
                lon: 185,
                size: 0.6
            },
            {
                name: 'The Nullary',
                url: 'https://github.com/planet-nine-app/the-nullary',
                // Southeastern position - right side of purple canvas
                lat: -22,
                lon: 95,
                size: 0.7
            }
        ];

        continentData.forEach(continent => {
            this.createClickableContinent(continent);
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

        // Create clickable plane (semi-transparent for debugging)
        const size = continent.size || 0.5;
        const continentGeometry = new THREE.CircleGeometry(size, 16);
        const continentMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3, // Make visible for debugging
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