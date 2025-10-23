export class SVGTextureLoader {
    /**
     * Loads an SVG file and converts it to a THREE.js texture
     * @param {string} svgPath - Path to the SVG file
     * @param {function} onLoad - Callback when texture is ready
     * @param {function} onError - Callback on error
     */
    static loadSVGTexture(svgPath, onLoad, onError) {
        fetch(svgPath)
            .then(response => response.text())
            .then(svgText => {
                const texture = this.svgToTexture(svgText);
                if (onLoad) onLoad(texture);
            })
            .catch(error => {
                console.error('Error loading SVG:', error);
                if (onError) onError(error);
            });
    }

    /**
     * Converts SVG text/markup to a THREE.js texture
     * @param {string} svgText - The SVG markup as a string
     * @returns {THREE.Texture} - A THREE.js texture
     */
    static svgToTexture(svgText) {
        // Create a blob from the SVG text
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        // Create an image element
        const img = new Image();

        // Create a canvas to rasterize the SVG
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Parse SVG to get dimensions
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');

        const width = parseInt(svgElement.getAttribute('width')) || 1024;
        const height = parseInt(svgElement.getAttribute('height')) || 1024;

        canvas.width = width;
        canvas.height = height;

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);

        // When image loads, draw it to canvas
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            texture.needsUpdate = true;
            URL.revokeObjectURL(url); // Clean up
        };

        img.onerror = (error) => {
            console.error('Error loading SVG image:', error);
            URL.revokeObjectURL(url);
        };

        img.src = url;

        return texture;
    }

    /**
     * Creates an SVG programmatically and converts it to a texture
     * @param {number} width - Width of the SVG
     * @param {number} height - Height of the SVG
     * @param {function} drawCallback - Callback that receives SVG element to add content
     * @returns {THREE.Texture} - A THREE.js texture
     */
    static createSVGTexture(width, height, drawCallback) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", width);
        svg.setAttribute("height", height);
        svg.setAttribute("xmlns", svgNS);

        // Let the callback add elements to the SVG
        if (drawCallback) {
            drawCallback(svg, svgNS);
        }

        // Serialize SVG to string
        const serializer = new XMLSerializer();
        const svgText = serializer.serializeToString(svg);

        return this.svgToTexture(svgText);
    }
}
