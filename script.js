import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.156.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.156.1/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load Globe Texture
const textureLoader = new THREE.TextureLoader();
const globeTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg');
const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
const globeMaterial = new THREE.MeshStandardMaterial({ map: globeTexture });
const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globeMesh);

// Lighting
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);

// Camera Position
camera.position.z = 10;

// Resize Handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    globeMesh.rotation.y += 0.001;
    controls.update();
    renderer.render(scene, camera);
}
animate();

// List of locations (latitude, longitude, and message)
const locations = [
    { lat: 40.7128, lon: -74.0060, message: "New York - Where we dream big together ❤️" },
    { lat: 48.8566, lon: 2.3522, message: "Paris - One day, we'll see the Eiffel Tower 🌟" },
    { lat: 35.6895, lon: 139.6917, message: "Tokyo - Sushi dates in the future 🍣" }
];

// Function to convert lat/lon to 3D coordinates
function latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
    );
}

// Create markers
const markerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

const markers = [];
locations.forEach(location => {
    const markerMesh = new THREE.Mesh(markerGeometry, markerMaterial);
    markerMesh.position.copy(latLonToVector3(location.lat, location.lon, 5.1));
    scene.add(markerMesh);
    markers.push({ mesh: markerMesh, message: location.message });
});

// Raycaster for detecting clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const popup = document.getElementById('popup');

window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(markers.map(m => m.mesh));

    if (intersects.length > 0) {
        const clickedMarker = markers.find(m => m.mesh === intersects[0].object);
        if (clickedMarker) {
            popup.innerHTML = `<p>${clickedMarker.message}</p>`;
            popup.style.display = 'block';
            setTimeout(() => { popup.style.display = 'none'; }, 3000);
        }
    }
});

