# ViuGeo

## Vue 3 + Vite + Leaflet + Firebase

![Vue 3](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js) ![Firebase](https://img.shields.io/badge/Firebase-Authentication_&_Storage-FFCA28?logo=firebase) ![Leaflet](https://img.shields.io/badge/Leaflet-Interactive_Maps-199900?logo=leaflet)

A web application built with Vue 3 that allows authenticated users to upload, store, and visualize GeoJSON files on an interactive Leaflet map. User authentication and data storage are handled by Google Firebase.

## Table of Contents

- [Features](#features)
- [Demo (not yet available)](#demo-not-yet-available)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Firebase Setup](#firebase-setup)
- [Installation \& Local Development](#installation--local-development)
- [Usage](#usage)

## Features

* **User Authentication:** Secure user registration and login using Firebase Authentication (e.g., Email/Password, Google Sign-In).
* **GeoJSON Upload:** Authenticated users can upload valid `.geojson` files.
* **GeoJSON Storage:** Uploaded files are associated with the user's account and stored securely (e.g., using Firebase Firestore or Firebase Storage).
* **File Listing:** Users can view a list of their previously uploaded GeoJSON files.
* **Interactive Map Visualization:** Select a file from the list to display its GeoJSON features on an interactive Leaflet map.
* **Map Controls:** Basic map controls like zoom and pan provided by Leaflet.

## Demo (not yet available)

## Technology Stack

* **Frontend Framework:** [Vue 3](https://vuejs.org/)
* **Build Tool:** [Vite](https://vite.dev/)
* **Mapping Library:** [Leaflet.js](https://leafletjs.com/)
* **Backend & Authentication:** [Firebase](https://firebase.google.com/)
    * Firebase Authentication
    * Firebase Firestore
* **Styling:** plain CSS/SCSS

## Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v18 or later)
* [npm](https://www.npmjs.com/)
* A Google Firebase account ([Firebase Console](https://console.firebase.google.com/))
* Git (for cloning the repository)

## Firebase Setup

1.  **Create Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add Web App:** Within your project, add a new Web application (`</>`).
3.  **Register App:** Give your app a nickname and register it. Firebase will provide you with configuration credentials (apiKey, authDomain, projectId, etc.). **Copy these credentials.**
4.  **Enable Authentication:** In the Firebase Console, navigate to `Build` > `Authentication`. Click "Get started" and enable the Google sign-in method.
5.  **Enable Database/Storage:**
    * **If using Firestore:** Go to `Build` > `Firestore Database`. Create a database. Start in **test mode** for easy development initially (`allow read, write: if true;`), but **remember to set up proper security rules before production** (`allow read, write: if request.auth != null;` is a common starting point for authenticated users).
    * **If using Firebase Storage:** Go to `Build` > `Storage`. Click "Get started". Set up security rules similar to Firestore (test mode initially, then secure for production).
6.  **Configure Environment Variables:** Duplicate the `.env.example` file in the root of the project and rename it to `.env` (this file should **not** be committed to Git). Add the Firebase configuration keys you copied in step 3. Use the Vite standard `VITE_` prefix:

    ```dotenv
    # .env
    VITE_API_KEY=""
    VITE_AUTH_DOMAIN=""
    VITE_PROJECT_ID=""
    VITE_STORAGE_BUCKET=""
    VITE_MESSAGING_SENDER_ID=""
    VITE_APP_ID=""
    ```
    *Note: Ensure your application code (e.g., `src/firebase.js`) reads these environment variables using `import.meta.env.VITE_FIREBASE_API_KEY`.*

## Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/fryttzz/viu-geo.git
    cd viu-geo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Firebase:** Follow the [Firebase Setup](#firebase-setup) instructions above and create your `.env` file with the necessary credentials.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running locally, typically at `http://localhost:5173` (Vite's default)

5.  **Build for production:**
    ```bash
    npm run build
    ```
    This will create a `dist` folder with the optimized static assets for deployment.

## Usage

1.  **Navigate** to the running application in your browser.
2.  **Register** for a new account or **Login** if you already have one using the enabled Firebase Authentication methods.
3.  Once logged in, you should see the main dashboard or map interface.
4.  Use the **Upload** feature on the top of the sidebar to select and upload a `.geojson` file from your computer. After upload, it will be already visible in the map interface.
5.  Give a name to your file and then save it.
6.  View your uploaded files in the **File List**.
7.  **Click** on a file in the list to load its features onto the Leaflet map.
8.  Interact with the map (zoom, pan) to explore the GeoJSON data.