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
    }, 1500);
});

// Handle Yes Button (Proceed to Globe)
yesButton.addEventListener('click', () => {
    overlay.style.display = 'none'; // Remove blur and popup
    canvas.style.display = 'block'; // Show the globe
    initGlobe(); // Start the 3D scene

    // Show Spotify player
    const musicContainer = document.getElementById('music-container');
    musicContainer.style.display = 'block';

    // Reload the iframe to refresh Spotify playback
    const spotifyIframe = document.getElementById('spotify-player');
    const newSrc = spotifyIframe.src; 
    spotifyIframe.src = ''; // Temporarily remove src
    setTimeout(() => {
        spotifyIframe.src = newSrc; // Reload with original src to force reload
    }, 500);

    setTimeout(() => {
        document.querySelector('header').style.display = 'none';
    }, 10000);
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
    scene.add(earthGroup);  

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

    // images, pins, and locations of each city 
    const locations = [
        { 
            lat: 39.9526, lon: -75.1652, name: "Philadelphia", 
            message: "Where we had our first adventure ❤️",
            media: ["content/philly_image1.PNG", "content/philly_image2.jpg", "content/philly_image3.jpg","content/philly_image4.jpg", "content/philly_image5.jpg","content/philly_image6.jpg"]
        },
        { 
            lat: 41.9028, lon: 12.4964, name: "Rome", 
            message: "The city of love and history! ✨",
            media: ["images/rome1.jpg", "images/rome2.jpg", "videos/rome_video.mp4"]
        },
        { 
            lat: 38.1157, lon: 13.3615, name: "Palermo", 
            message: "Imagine strolling through Sicily together! 🌊",
            media: ["images/palermo1.jpg", "images/palermo2.jpg"]
        },
        { 
            lat: 47.6588, lon: -117.4260, name: "Spokane", 
            message: "Where Gonzaga made life special 💙",
            media: ["content/spokane_image1.jpg", "content/spokane_iamge2.jpg","content/spokane_image3.JPG","content/spokane_image4.jpg",]
        },
        { 
            lat: 40.7831, lon: -73.9712, name: "New York", 
            message: "Our future home? 🏙️",
            media: ["content/nyc_image1.jpg", "content/nyc_image2.jpg", "content/nyc_image3.jpg"]
        },
        { 
            lat: 34.0522, lon: -118.2437, name: "Los Angeles", 
            message: "Maybe a beach day soon? 🌴",
            media: ["content/la_image1.JPG", "content/la_image2.jpg"]
        },
        { 
            lat: 41.8781, lon: -87.6298, name: "Chicago", 
            message: "Deep-dish pizza date incoming! 🍕",
            media: ["content/chicago_image1.JPG", "content/chicago_image1.jpg","content/chicago_image2.jpg"]
        },
        { 
            lat: 33.4270, lon: -117.6120, name: "San Clemente", 
            message: "Sunsets here would be magical 🌅",
            media: ["content/sanclem_image1.JPG", "content/sanclem_image2.jpg", "content/sanclem_movie.mov"]
        },
        { 
            lat: 48.2082, lon: 16.3738, name: "Vienna", 
            message: "Dancing to classical music in Vienna? 🎻💃",
            media: ["images/vienna1.jpg", "images/vienna2.jpg", "videos/vienna_video.mp4"]
        }
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
        earthGroup.add(pin);  
        pins.push({ mesh: pin, name: location.name, message: location.message, media: location.media });
    });

    // Define mouse vector for raycasting
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // Click Interaction - Opens Pop-Up with Unique Message & Carousel
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(pins.map(p => p.mesh));

        if (intersects.length > 0) {
            const clickedPin = pins.find(p => p.mesh === intersects[0].object);
            if (clickedPin) {
                showPopup(clickedPin.name, clickedPin.message, clickedPin.media);
            }
        }
    });


    // Function to Show Pop-Up with a Carousel
    function showPopup(locationName, message, media) {
        let mediaIndex = 0;

        function getMediaHTML() {
            const currentMedia = media[mediaIndex];
            if (currentMedia.endsWith(".mp4")) {
                return `<video src="${currentMedia}" controls autoplay muted width="300"></video>`;
            } else {
                return `<img src="${currentMedia}" width="300" height="200" style="border-radius:10px;">`;
            }
        }

        popup.innerHTML = `
            <p><strong>${locationName}</strong></p>
            <p>${message}</p>
            <div id="carousel-container">
                ${getMediaHTML()}
            </div>
            <div>
                <button id="prev-btn">⬅️</button>
                <button id="next-btn">➡️</button>
            </div>
            <button id="close-popup">Close</button>
        `;
        popup.style.display = 'block';

        document.getElementById('prev-btn').addEventListener('click', () => {
            mediaIndex = (mediaIndex - 1 + media.length) % media.length;
            document.getElementById('carousel-container').innerHTML = getMediaHTML();
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            mediaIndex = (mediaIndex + 1) % media.length;
            document.getElementById('carousel-container').innerHTML = getMediaHTML();
        });

        document.getElementById('close-popup').addEventListener('click', () => {
            popup.style.display = 'none';
        });
    }

    function animate() {
        requestAnimationFrame(animate);
        earthGroup.rotation.y += 0.002;  
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
