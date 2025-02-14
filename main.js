import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const overlay = document.getElementById('overlay');
const yesButton = document.getElementById('yes-btn');
const noButton = document.getElementById('no-btn');
const canvas = document.getElementById('bg');
const popup = document.getElementById('popup');


noButton.addEventListener('click', () => {
    noButton.innerText = "Im gonna pretend u misclicked ";
    setTimeout(() => {
        noButton.innerText = "No";
    }, 1500);
});

yesButton.addEventListener('click', () => {
    overlay.style.display = 'none'; // remove blur and popup
    canvas.style.display = 'block'; // show globe
    initGlobe(); // start scene

    // show header pop up
    const headerPopup = document.getElementById('header-popup');
    headerPopup.style.display = 'block';

    // show spotify player
    const musicContainer = document.getElementById('music-container');
    musicContainer.style.display = 'block';

    const spotifyIframe = document.getElementById('spotify-player');
    spotifyIframe.src = spotifyIframe.src; 

});

document.getElementById('close-header').addEventListener('click', () => {
    document.getElementById('header-popup').style.display = 'none';
});


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

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/8/83/Equirectangular_projection_SW.jpg');

    // create earth and earth group and structure
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    
    const earthGroup = new THREE.Group();
    earthGroup.add(earth);
    scene.add(earthGroup);  

    earthGroup.rotation.y = Math.PI / -2; // rotation start at europe
    // earthGroup.rotation.x = 0.5;  // makes starting x axis weird - not needed 


    // light
    const pointLight = new THREE.PointLight(0xffffff, 2);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight, new THREE.AmbientLight(0xffffff, 0.3));

    // stars
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
            message: "Philly with you these past two times have been the most fun I’ve had with you. It went by so fast but so much fun and so much food. I’ll never forget how when I came back after from the bathroom and that whole plate of food that was brought out and thought u had ordered more. Insane saige.",
            media: ["/content/philly_image3.jpg", "/content/philly_image2.jpg", "/content/philly_image1.PNG","/content/philly_image4.jpg", "/content/philly_image5.jpg","/content/philly_image6.jpg"]
        },
        { 
            lat: 41.9028, lon: 12.4964, name: "Rome", 
            message: "We’ll be here soon eating pistachio gelato",
            media: ["/content/Rome.jpg"]
        },
        { 
            lat: 38.1157, lon: 13.3615, name: "Palermo", 
            message: "Our retreat to palermo just like white lotus ",
            media: ["/content/palermo.jpg"]
        },
        { 
            lat: 47.6588, lon: -117.4260, name: "Spokane", 
            message: " I can’t wait for you to come back so we can f up some milk shakes again.",
            media: ["/content/spokane_image1.jpg", "/content/spokane_image2.jpg","/content/spokane_image3.JPG","/content/spokane_image4.jpg",]
        },
        { 
            lat: 40.7831, lon: -73.9712, name: "New York", 
            message: "I fell for you saige 😾 from that interesting park in Brooklyn to you getting lost otw to culture and that Mexican restaurant it was such a fun summer. I can’t wait to do it again this summer",
            media: ["/content/nyc_image1.jpg", "/content/nyc_image2.jpg", "/content/nyc_image3.jpg"]
        },
        { 
            lat: 34.0522, lon: -118.2437, name: "Los Angeles", 
            message: "My favorite part was when I beat u every single time during top golf but the pics don’t show that 😾 I think the time we went to LA and then went to lighthouse cafe has been one of my favorite memories with you. You looked so happy and it was so fun. I still remember how that old lady tried dancing and that amazing neighborhood in silver lake, it’s always fun with you exploring.",
            media: ["/content/la_image1.JPG", "/content/la_image2.jpg"]
        },
        { 
            lat: 41.8781, lon: -87.6298, name: "Chicago", 
            message: "Our first trip together is still insane to think about. All that food we ate and how full we were makes me happy to think about. I appreciate you being a normal person and not being weird 🤣 I’m glad we went, it was our first trip of many. ",
            media: ["/content/chicago_image1.JPG", "/content/chicago_image2.jpg","/content/chicago_image3.jpg"]
        },
        { 
            lat: 33.4270, lon: -117.6120, name: "San Clemente", 
            message: "This is home saigeypoo. Thank you for showing me around your hometown and your favorite place to look out and eat. Idk if it’s going to show but it’s the crumbl review we did, I still think it’s funny how we held back and tried being so polite when eating all those cookies. It’s also the last time I saw you it was such a wholesome goodbye I’m glad you’re having so much fun in Vienna tho it makes me happy to know you’re exploring and treating ur self ",
            media: ["/content/sanclem_image1.JPG", "/content/sanclem_image2.jpg", "/content/sanclem_movie.mov"]
        },
        { 
            lat: 48.2082, lon: 16.3738, name: "Vienna", 
            message: "Can’t wait to see ur everyday view and go to the jazz bar finally",
            media: ["/content/Vienna.jpg"]
        }
    ];
    

    // func to convert lat/lon to 3D coords
    function latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // create pins and add them as children of earth
    const pinGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const pinMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

    const pins = [];
    locations.forEach(location => {
        const pin = new THREE.Mesh(pinGeometry, pinMaterial);
        pin.position.copy(latLonToVector3(location.lat, location.lon, 5.1));
        earthGroup.add(pin);  
        pins.push({ mesh: pin, name: location.name, message: location.message, media: location.media });
    });

    // define mouse vector for raycasting
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();

    // opens pop up and image carousel
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
        earthGroup.rotation.y += 0.0005;  
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
