<script setup>
import { logout, useAuth } from "@/services/authService";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import L from 'leaflet';
import { collection, getDocs, query, where } from "firebase/firestore";

const router = useRouter();
const { user } = useAuth()

const map = ref(null),
    currentGeoJSON = ref(null),
    mapName = ref(''),
    savedMaps = ref([]),
    geoJSONLayer = ref(null)

// Inicializa o mapa Leaflet
const initMap = () => {
    map.value = L.map('map').setView([0, 0], 2);

    // Adiciona o mapa base OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);
}

// Manipula o upload de arquivo GeoJSON
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const geojsonData = JSON.parse(e.target.result);
            displayGeoJSON(geojsonData);
            currentGeoJSON.value = geojsonData;
        } catch (error) {
            console.error("Erro ao analisar o arquivo GeoJSON:", error);
            alert("Falha ao carregar o arquivo GeoJSON. Verifique o formato.");
        }
    };
    reader.readAsText(file);
}

// Exibe o GeoJSON no mapa
const displayGeoJSON = (geojsonData) => {
    // Remove a camada GeoJSON existente, se houver
    if (geoJSONLayer) {
        map.value.removeLayer(geoJSONLayer);
    }

    // Adiciona a nova camada GeoJSON
    geoJSONLayer.value = L.geoJSON(geojsonData, {
        style: {
            color: '#3388ff',
            weight: 3,
            opacity: 0.7
        },
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#3388ff',
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    }).addTo(map);

    // Ajusta a visualização para caber nos dados GeoJSON
    try {
        map.fitBounds(geoJSONLayer.value.getBounds());
    } catch (e) {
        console.warn("Não foi possível ajustar os limites do mapa:", e);
    }
}

// Salva o mapa no Firestore
const saveMap = async () => {
    if (!currentGeoJSON) {
        alert("Carregue um arquivo GeoJSON antes de salvar.");
        return;
    }

    if (!mapName.value.trim()) {
        alert("Digite um nome para o mapa.");
        return;
    }

    try {
        await addDoc(collection(db, "userMaps"), {
            userId: user.uid,
            name: mapName.value,
            geojson: JSON.stringify(currentGeoJSON),
            createdAt: new Date()
        });

        alert("Mapa salvo com sucesso!");
        mapName.value = '';
        loadUserMaps();
    } catch (error) {
        console.error("Erro ao salvar o mapa:", error);
        alert("Falha ao salvar o mapa.");
    }
}

// Carrega os mapas do usuário
const loadUserMaps = async () => {
    if (!user) return;

    try {
        const q = query(
            collection(db, "maps"),
            where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        savedMaps.value = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            savedMaps.value.push({
                id: doc.id,
                name: data.name,
                geojson: JSON.parse(data.geojson)
            });
        });
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
        alert("Falha ao carregar seus mapas.");
    }
}

// Carrega um mapa salvo
const loadSavedMap = (map) => {
    currentGeoJSON.value = map.geojson;
    displayGeoJSON(map.geojson);
    mapName.value = map.name;
}

const handleLogout = async () => {
    try {
        await logout();
        router.push({ name: "Login" })
        // setNotification("success", "Você foi desconectado com sucesso")
    } catch (error) {
        console.error("Erro ao desconectar sua conta Google:", error.message);
    }
}

onMounted(() => {
    initMap();
    // loadUserMaps();
    // // Carrega o mapa salvo, se houver
    // if (savedMaps.value.length > 0) {
    //     loadSavedMap(savedMaps.value[0]);
    // }
})

</script>

<template>
    <div id="home-page">
        <header class="header">
            <div class="user-info">
                <img :src="user.photoURL" alt="Avatar" class="user-avatar">
                <span>{{ user.displayName }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">Sair</button>
        </header>
        <div class="map-container">
            <div class="sidebar">
                <div class="map-controls">
                    <h3 class="section-title">Carregar GeoJSON</h3>
                    <input type="file" class="file-input" accept=".geojson,.json" @change="handleFileUpload">
                    <input v-model="mapName" type="text" class="map-name-input" placeholder="Nome do mapa">
                    <button class="save-btn" @click="saveMap">Salvar Mapa</button>
                </div>
                <div class="saved-maps-section">
                    <h3 class="section-title">Meus Mapas</h3>
                    <ul class="saved-maps">
                        <li v-for="(map, index) in savedMaps" :key="index" class="map-item" @click="loadSavedMap(map)">
                            {{ map.name }}
                        </li>
                    </ul>
                </div>
            </div>
            <div id="map"></div>
        </div>
    </div>
</template>

<style>
/* Tela Home / Mapa */
#home-page {
    display: none;
    height: 100vh;
    width: 100%;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: #4a4a4a;
    color: white;
}

.user-info {
    display: flex;
    align-items: center;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-right: 10px;
}

.logout-btn {
    background-color: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 4px;
    padding: 0.4rem 0.8rem;
    cursor: pointer;
    transition: all 0.3s;
}

.logout-btn:hover {
    background-color: white;
    color: #4a4a4a;
}

.map-container {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px);
}

.sidebar {
    width: 300px;
    background-color: white;
    padding: 1rem;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
}

.map-controls {
    margin-bottom: 1.5rem;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
}

.file-input {
    width: 100%;
    margin-bottom: 0.5rem;
}

.saved-maps {
    list-style: none;
}

.map-item {
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
}

.map-item:hover {
    background-color: #f5f5f5;
}

#map {
    flex: 1;
    height: 100%;
}

.save-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    margin-top: 0.5rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.save-btn:hover {
    background-color: #3e8e41;
}

.map-name-input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

@media (max-width: 768px) {
    .map-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: 40%;
        border-right: none;
        border-bottom: 1px solid #e0e0e0;
    }

    #map {
        height: 60%;
    }
}
</style>