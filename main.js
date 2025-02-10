import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Get UI Elements
const overlay = document.getElementById('overlay');
const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
const canvas = document.getElementById('bg');
const popup = document.getElementById('popup');

// Handle No Button 
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
    }, 10000); // 10 seconds

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
    controls.enableZoom = true; 
    controls.minDistance = 6;  
    controls.maxDistance = 20; 

    // Load Earth Texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg');

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    
    // Create a Group to Hold the Earth and Pins Together
    const earthGroup = new THREE.Group();
    earthGroup.add(earth);
    scene.add(earthGroup);  // Add the group instead of the Earth directly

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

    // Locations with Pins
    const locations = [
        { lat: 39.9526, lon: -75.1652, name: "Philadelphia" },
        { lat: 41.9028, lon: 12.4964, name: "Rome" },
        { lat: 38.1157, lon: 13.3615, name: "Palermo" },
        { lat: 47.6588, lon: -117.4260, name: "Spokane" },
        { lat: 40.7831, lon: -73.9712, name: "Manhattan" },
        { lat: 40.6782, lon: -73.9442, name: "Brooklyn" },
        { lat: 34.0522, lon: -118.2437, name: "Los Angeles" },
        { lat: 41.8781, lon: -87.6298, name: "Chicago" },
        { lat: 33.4270, lon: -117.6120, name: "San Clemente" },
        { lat: 48.2082, lon: 16.3738, name: "Vienna" }
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

    // Create pins and add them as children of Earth
    const pinGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const pins = [];
    locations.forEach(location => {
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.copy(latLonToVector3(location.lat, location.lon, 5.1));
        earthGroup.add(pin);  // Add pins to the Earth group
        pins.push({ mesh: pin, name: location.name });
    });

    // Click Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pins.map(p => p.mesh));

        if (intersects.length > 0) {
            const clickedPin = pins.find(p => p.mesh === intersects[0].object);
            if (clickedPin) {
                showPopup(clickedPin.name);
            }
        }
    });

    // Function to Show opo up
    function showPopup(locationName) {
        popup.innerHTML = `<p>${locationName}</p> <button id="close-popup">Close</button>`;
        popup.style.display = 'block';

        document.getElementById('close-popup').addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        earthGroup.rotation.y += 0.002;  // Rotate the whole group (Earth and Pins)
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
