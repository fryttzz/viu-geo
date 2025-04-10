<script setup>
import { logout, useAuth } from "@/services/authService";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { loadUserMaps, saveMap } from "../services/mapsService";
import L from 'leaflet';
import "leaflet/dist/leaflet.css"

const router = useRouter();
const { user } = useAuth()

const map = ref(null),
    currentGeoJSON = ref(null),
    mapName = ref(''),
    savedMaps = ref([]),
    geoJSONLayer = ref(null)

const initMap = () => {
    map.value = L.map('map').setView([-16, -49], 4);

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
    }).addTo(map.value);

    // Ajusta a visualização para caber nos dados GeoJSON
    try {
        map.value.fitBounds(geoJSONLayer.value.getBounds());
    } catch (e) {
        console.warn("Não foi possível ajustar os limites do mapa:", e);
    }
}

// Salva o mapa no Firestore
const handleSaveMap = async () => {
    if (!currentGeoJSON) {
        alert("Carregue um arquivo GeoJSON antes de salvar.");
        return;
    }

    if (!mapName.value.trim()) {
        alert("Digite um nome para o mapa.");
        return;
    }

    try {
        await saveMap(mapName, currentGeoJSON);
        alert("Mapa salvo com sucesso!");
        mapName.value = '';
        handleLoadUserMaps();
    } catch (error) {
        console.error("Erro ao salvar o mapa:", error);
        alert("Falha ao salvar o mapa.");
    }
}

// Carrega os mapas do usuário
const handleLoadUserMaps = async () => {
    if (!user) return;

    try {
        savedMaps.value = [];
        savedMaps.value = await loadUserMaps()
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
    }
}

// Carrega um mapa salvo
const loadSavedMap = (map) => {
    console.log(map);
    currentGeoJSON.value = map.geojson;
    displayGeoJSON(map.geojson);
    mapName.value = map.name;
}

const handleClearMaps = () => {
    currentGeoJSON.value = null
    mapName.value = ''
    if (geoJSONLayer) {
        map.value.removeLayer(geoJSONLayer);
    }
    geoJSONLayer.value = null
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
    handleLoadUserMaps();
    // Carrega o mapa salvo, se houver
    if (savedMaps.value.length > 0) {
        loadSavedMap(savedMaps.value[0]);
    }
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
                    <div class="map-row-btns">
                        <button class="save-btn" @click="handleSaveMap">Salvar Mapa</button>
                        <button class="clear-btn" @click="handleClearMaps">Limpar</button>
                    </div>
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
#home-page {
    height: 100vh;
    width: 100%;
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

.sidebar {
    width: 300px;
    background-color: white;
    padding: 1rem;
    border-right: 1px solid #e0e0e0;
    overflow-y: auto;
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

.map-container {
    display: flex;
    flex: 1;
    height: calc(100vh - 60px);
}

.map-controls {
    margin-bottom: 1.5rem;
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

.map-name-input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
}

#map {
    flex: 1;
    height: 100%;
}

.map-row-btns {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    margin-top: 0.5rem;
}

.save-btn {
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.clear-btn {
    color: #4caf50;
    border: 2px solid #4caf50;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: background-color 0.3s;
}

.save-btn:hover {
    background-color: #3e8e41;
}

.clear-btn:hover {
    border-color: #3e8e41;
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