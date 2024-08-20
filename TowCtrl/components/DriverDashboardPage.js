import 'leaflet/dist/leaflet.css';
import L from "leaflet";
import markerIcon from "../src/images/marker-icon.png";
import markerIcon2x from "../src/images/marker-icon-2x.png";
import markerShadow from "../src/images/marker-shadow.png";
import currentLocationIcon from "../src/current-location-marker.png";
import incidentSpotMarker from "../src/incident-spot-marker.png";
import Router from "../services/Router.js";
import { signOut } from "firebase/auth";
import { auth, dataBase } from "../services/firebase.js";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

export default class DriverDashboardPage extends HTMLElement {

    constructor() {

        super();

        this.activeCases = [];

        this.driverLatitude;
        this.driverLongitude;

        this.map;

    }

    displayMap = async () => {

        navigator.geolocation.getCurrentPosition(async (position) => {

            // Succuss Callback Code:
            console.log(`testing offline v1`);

            // Hiding spinners
            let spinners = document.querySelectorAll('.loading');
            spinners.forEach(function (element) {
                element.style.display = 'none';
            });

            // Destructuring latitude and longitude from position.coords object
            const { latitude } = position.coords;
            const { longitude } = position.coords;

            this.driverLatitude = latitude;
            this.driverLongitude = longitude;

            const coordinates = [latitude, longitude];

            // Leaflet Code - Start
            // Rendering map centered on a current user location (coordinates) with max zoom-in setting
            this.map = L.map('map').setView(coordinates, 18);

            // Original Tile
            const originalTile = 'https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png';

            // Mapbox Monochrome
            const monochrome = `https://api.mapbox.com/styles/v1/stormymayday/${import.meta.env.VITE_MAPBOX_STYLE}/tiles/256/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}`;

            // Tilelayer
            L.tileLayer(monochrome, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.map);

            // let leafletIcon = L.icon({
            //     iconUrl: markerIcon,
            //     iconRetinaUrl: markerIcon2x,
            //     iconSize: [25, 41],
            //     iconAnchor: [12, 41],
            //     popupAnchor: [1, -34],
            //     shadowUrl: markerShadow,
            //     // shadowRetinaUrl: 'marker-shadow-2x.png',
            //     shadowSize: [41, 41],
            //     shadowAnchor: [12, 41]
            // });

            let leafletIcon = L.icon({
                iconUrl: currentLocationIcon,
                iconRetinaUrl: currentLocationIcon,
                iconSize: [130, 130],
                iconAnchor: [65, 80],
                popupAnchor: [1, -34]
            });

            // Displaying a Marker with current user coordinates
            L.marker(coordinates, { icon: leafletIcon }).addTo(this.map)
                .bindPopup(
                    L.popup({
                        autoClose: false,
                        closeOnClick: false,
                        className: 'running-popup',
                    })
                )
                .setPopupContent('You are currently here')
                .openPopup();

            try {

                await this.getActiveCases();

                // this.renderCaseCards();

                // this.renderMarkers();

            } catch (error) {

                console.error(error);

            }
            // Leaflet Code - End

        }, () => {

            // Error Callback Code:

            alert(`Unfortunately, TowTackle was not able to pick up your position.`);

        });

    }

    renderMarkers() {

        // Clear existing markers from the map
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                this.map.removeLayer(layer);
            }
        });

        // let leafletIcon = L.icon({
        //     iconUrl: markerIcon,
        //     iconRetinaUrl: markerIcon2x,
        //     iconSize: [25, 41],
        //     iconAnchor: [12, 41],
        //     popupAnchor: [1, -34],
        //     shadowUrl: markerShadow,
        //     // shadowRetinaUrl: 'marker-shadow-2x.png',
        //     shadowSize: [41, 41],
        //     shadowAnchor: [12, 41]
        // });

        let leafletIcon = L.icon({
            iconUrl: currentLocationIcon,
            iconRetinaUrl: currentLocationIcon,
            iconSize: [130, 130],
            iconAnchor: [65, 80],
            popupAnchor: [1, -34]
        });

        // Displaying a Marker with current user coordinates
        L.marker([this.driverLatitude, this.driverLongitude], { icon: leafletIcon }).addTo(this.map)
            .bindPopup(
                L.popup({
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                })
            )
            .setPopupContent('You are currently here')
            .openPopup();


        if (this.activeCases.length > 0) {

            this.activeCases.forEach((activeCase) => {

                console.log(activeCase);

                const { latitude, longitude } = activeCase.data.coordinates;

                let incidentMarker = {};

                // let leafletIcon = L.icon({
                //     iconUrl: markerIcon,
                //     iconRetinaUrl: markerIcon2x,
                //     iconSize: [25, 41],
                //     iconAnchor: [12, 41],
                //     popupAnchor: [1, -34],
                //     shadowUrl: markerShadow,
                //     // shadowRetinaUrl: 'marker-shadow-2x.png',
                //     shadowSize: [41, 41],
                //     shadowAnchor: [12, 41]
                // });

                let leafletIcon = L.icon({
                    iconUrl: incidentSpotMarker,
                    iconRetinaUrl: incidentSpotMarker,
                    iconSize: [50, 82],
                    iconAnchor: [24, 70],
                    popupAnchor: [1, -34]
                });

                // Creating Markers on the Map
                incidentMarker = L.marker([latitude, longitude], { icon: leafletIcon }).addTo(this.map)
                    .bindPopup(
                        L.popup({
                            autoClose: false,
                            closeOnClick: false,
                            className: 'running-popup',
                        })
                    )
                    .setPopupContent(activeCase.data.notes);
                // .openPopup();

            });

        } else {

            console.log(`There are no active cases`);

        }

    }
    // end of renderMarkers

    myFunction(id) {
        document.getElementById("id").innerHTML = "YOU CLICKED ME!";
    }

    renderCaseCards() {

        // Clearing
        this.querySelector('.case-container').innerHTML = '';

        if (this.activeCases.length > 0) {

            const content = this.activeCases.map((activeCase) => {

                const id = activeCase.id;
                const { image, notes, status } = activeCase.data;
                const date = new Date(activeCase.data.creationTime.seconds * 1000);

                // Month name array
                const monthNames = [
                    'January', 'February', 'March', 'April',
                    'May', 'June', 'July', 'August',
                    'September', 'October', 'November', 'December'
                ];

                // Get month, day, year, hour, and minute
                const month = monthNames[date.getMonth()];
                const day = date.getDate();
                const year = date.getFullYear();
                let hour = date.getHours();
                const minute = date.getMinutes();
                const period = hour >= 12 ? 'PM' : 'AM';

                // Convert hour to 12-hour format
                hour = hour % 12 || 12;

                // Create the formatted date string
                const formattedDate = `${month} ${day}, ${year}, ${hour}:${minute.toLocaleString('en-US', { minimumIntegerDigits: 2 })} ${period}`;

                console.log(formattedDate);

                return `
                    <div class="case-item">
                        <div class="case-img-container">
                            <img src=${image} alt="" />
                        </div>
                        <div class="case-info">
                            <div>
                                <span class="new-request">New Request</span>
                            </div>
                            <h3 class="case-notes">${notes}</h3>
                            <p class="date-text">${formattedDate}</p>
                            <div class="container-user-case-view-incident">
								<p id=${id} class="case-btn">VIEW INCIDENT<i class="right-icon-arrow-view-case"></i></p>
							</div>
                        </div>
                    </div>
                `;

            }).join('');

            this.querySelector('.case-container').innerHTML = content;

            // Selecting all 'View Incident' buttons and attaching an event listener
            const viewCaseButtons = this.querySelectorAll('.case-btn');

            viewCaseButtons.forEach(caseButton => {

                caseButton.addEventListener('click', () => {

                    console.log(`You clicked on a case button with an id of ${caseButton.id}`);

                    // Setting Local Storage here
                    const storedCases = JSON.parse(localStorage.getItem("activeCases"));
                    const filteredCase = storedCases.filter((item) => {

                        return caseButton.id == item.id;

                    });
                    localStorage.setItem("currentCase", JSON.stringify(filteredCase[0]));

                    Router.go('/case');

                });

            });



        } else {

            console.log(`There are no active cases`);

        }


    }
    // end of renderCaseCards

    async getActiveCases() {

        // Clear activeCases from local storage
        localStorage.removeItem("activeCases");

        this.activeCases = [];

        const user = JSON.parse(localStorage.getItem('user'));

        // Reference to the Firestore collection
        const casesCollection = collection(dataBase, "cases");

        // Initialize a query to filter only 'active' cases
        const myQuery = query(casesCollection, where("status", "==", "active"));

        // Listen to changes in the filtered collection
        const unsubscribe = onSnapshot(myQuery, (snapshot) => {
            // Clear the activeCases array before adding new data
            this.activeCases = [];

            snapshot.forEach((doc) => {
                const activeCase = {
                    id: doc.id,
                    data: doc.data()
                };
                this.activeCases.push(activeCase);
                const { latitude, longitude } = doc.data().coordinates;
                const coordinates = [latitude, longitude];
                localStorage.setItem("activeCases", JSON.stringify(this.activeCases));
            });

            // Now that you have updated activeCases, you can render the data.
            this.renderCaseCards();
            this.renderMarkers();

            console.log(this.activeCases);

            console.log(`re-fetching`);

        });
    }

    async logOut() {

        await signOut(auth);

        Router.go(`/login`);

    }

    connectedCallback() {

        if (!navigator.onLine) {

            Router.go('/offline');

        }

        // Getting template from the DOM
        const template = document.getElementById('driver-dashboard-page-template');

        // Cloning the template
        const content = template.content.cloneNode(true);

        // Appending content to the DOM
        this.appendChild(content);

        const user = JSON.parse(localStorage.getItem('user'));
        const userRole = JSON.parse(localStorage.getItem('userRole'));

        if (user) {

            // console.log(user);

            this.querySelector('#user-name').innerHTML = user.nameRegistration;
            this.querySelector('#user-email').innerHTML = user.email;
            // this.querySelector('h3').innerHTML = `Welcome ${userRole}`;

            // Testing if navigator.geolocation is supported by the browser
            if (navigator.geolocation) {

                this.displayMap();

            }
            // end of navigator / Leaflet

        }

        this.querySelector("#logout-btn").addEventListener("click", async (event) => {

            localStorage.clear();

            await this.logOut();

        });

    }

}

customElements.define("driver-dashboard-page", DriverDashboardPage);