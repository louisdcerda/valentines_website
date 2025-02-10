import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Get UI Elements
const overlay = document.getElementById('overlay');
const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
const canvas = document.getElementById('bg');

// Handle No Button (Playful Response)
noButton.addEventListener('click', () => {
    noButton.innerText = "Are you sure? 😢";
    setTimeout(() => {
        noButton.innerText = "No";
    }, 15000);
});

// Handle Yes Button (Proceed to Globe)
yesButton.addEventListener('click', () => {
    overlay.style.display = 'none'; // Remove blur and popup
    canvas.style.display = 'block'; // Show the globe
    initGlobe(); // Start the 3D scene
    // Hide header after 30 seconds
    setTimeout(() => {
      document.querySelector('header').style.display = 'none';
    }, 10000); // 30,000 milliseconds = 30 seconds

});

// Globe Initialization
function initGlobe() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.setZ(10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true; // Make sure zooming is enabled
    controls.minDistance = 6;  // Minimum zoom-in distance (closer to Earth)
    controls.maxDistance = 20; // Maximum zoom-out distance (farther from Earth)


    // Load Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg');

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Lights
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight, new THREE.AmbientLight(0xffffff, 0.3));

    // Stars
    function addStar() {
        const geometry = new THREE.SphereGeometry(0.15, 24, 24);
        const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const star = new THREE.Mesh(geometry, material);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
        star.position.set(x, y, z);
        scene.add(star);
    }
    Array(200).fill().forEach(addStar);

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        earth.rotation.y += 0.002;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
