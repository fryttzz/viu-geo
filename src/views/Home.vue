<script setup>
import { logout, useAuth } from "@/services/authService";
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import { loadUserMaps, saveMap, getMapFeatures, saveProject, loadUserProjects } from "../services/mapsService";
import { useNotification } from '@/stores/notificationStore';
import IconAdd from "@/components/icons/IconAdd.vue"
import IconArrow from "@/components/icons/IconArrow.vue"
import L from 'leaflet';
import "leaflet/dist/leaflet.css"

const router = useRouter();
const { user } = useAuth()
const { setNotification } = useNotification()

const map = ref(null),
    currentGeoJSON = ref(null),
    mapName = ref(''),
    projectName = ref(''),
    currentProject = ref({}),
    savedProjects = ref([]),
    geoJSONLayer = ref(null),
    displayedMaps = ref([]),
    newProject = ref(false)

const initMap = () => {
    map.value = L.map('map').setView([-16, -49], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map.value);
}

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

const displayMaps = () => {
    handleClearMap()

    if (!displayedMaps.value || displayedMaps.value.length <= 0) {
        return;
    }
    setGeoJsonLayer()
};

const displayGeoJSON = (geojsonData) => {
    if (geoJSONLayer) {
        map.value.removeLayer(geoJSONLayer);
    }
    setGeoJsonLayer(geojsonData)
}

const setGeoJsonLayer = (geojsonData) => {
    geoJSONLayer.value = L.geoJSON(geojsonData ? geojsonData : displayedMaps.value, {
        style: {
            color: '#3388ff',
            weight: 3,
            opacity: 1
        },
        pointToLayer: (feature, latlng) => {
            return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#3388ff',
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 1
            });
        }
    }).bindPopup(function (layer) {
        return layer.feature?.properties?.Name || "Sem nome";
    }).addTo(map.value);

    try {
        if (geoJSONLayer.value && typeof geoJSONLayer.value.getBounds === 'function') {
            const bounds = geoJSONLayer.value.getBounds();
            if (bounds.isValid()) {
                map.value.fitBounds(bounds);
            } else {
                console.warn("Bounds da camada GeoJSON inválidos.");
            }
        }
    } catch (e) {
        console.warn("Não foi possível ajustar os limites do mapa:", e);
    }
}

const handleSaveMap = async () => {
    if (!currentGeoJSON) {
        alert("Carregue um arquivo GeoJSON antes de salvar.");
        return;
    }

    if (!mapName.value.trim()) {
        alert("Digite um nome para o mapa.");
        return;
    }

    if (currentProject.value === {}) {
        alert("Selecione um projeto para o mapa.");
        return;
    }

    try {
        await saveMap(mapName, currentProject.value.projectId, currentGeoJSON);
        alert("Mapa salvo com sucesso!");
        mapName.value = '';
        if (geoJSONLayer) {
            map.value.removeLayer(geoJSONLayer.value);
        }
        handleLoadUserMaps(currentProject.value.projectId, currentProject.value.index);
        currentProject.value = {}
    } catch (error) {
        console.error("Erro ao salvar o mapa:", error);
        alert("Falha ao salvar o mapa.");
    }
}

const handleLoadUserMaps = async (projectId, index) => {
    if (!user) return;
    try {
        if (savedProjects.value[index].maps) {
            delete savedProjects.value[index].maps
            displayMaps()
        } else {
            savedProjects.value[index].maps = await loadUserMaps(projectId)
        }
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
    }
}

const handleLoadUserProjetcs = async () => {
    if (!user) return;
    try {
        savedProjects.value = [];
        savedProjects.value = await loadUserProjects()
    } catch (error) {
        console.error("Erro ao carregar os projetos:", error);
    }
}

const loadSavedMap = async (newMap) => {
    const completyMap = await getMapFeatures(newMap)
    if (displayedMaps.value.find(element => element.id === completyMap.id)) {
        const found = displayedMaps.value.find(element => element.id === completyMap.id)
        displayedMaps.value = displayedMaps.value.filter(map => map !== found)
        displayMaps();
    } else {
        displayedMaps.value.push(completyMap)
        displayMaps();
    }
}

const handleNewProject = () => {
    newProject.value === false ? newProject.value = true : newProject.value = false
}

const handleSaveNewProject = async (e) => {
    if (e.key === 'Enter') {
        await saveProject(projectName.value)
        handleNewProject()
        handleLoadUserProjetcs()
    } else if (e.key === "Escape") {
        handleNewProject()
    }
}

const handleClearMap = (all) => {
    currentGeoJSON.value = null
    mapName.value = ''
    if (all) {
        displayedMaps.value = []
        savedProjects.value.forEach(project => {
            delete project.maps
        })
    }
    if (geoJSONLayer.value) {
        if (map.value) {
            map.value.removeLayer(geoJSONLayer.value);
        }
        geoJSONLayer.value = null;
    }
}

const handleLogout = async () => {
    try {
        await logout();
        router.push({ name: "Login" })
        setNotification("success", "Você foi desconectado com sucesso")
    } catch (error) {
        console.error("Erro ao desconectar sua conta Google:", error.message);
    }
}

onMounted(() => {
    initMap();
    handleLoadUserProjetcs();
})

</script>

<template>
    <div id="home-page">
        <header class="header">
            <div class="user-info">
                <img :src="user.photoURL" alt="Avatar" class="user-avatar">
                <span>Olá, {{ user.displayName }}</span>
            </div>
            <button class="logout-btn" @click="handleLogout">Sair</button>
        </header>
        <div class="map-container">
            <div class="sidebar">
                <div class="map-controls">
                    <h3 class="section-title">Carregar GeoJSON</h3>
                    <input type="file" class="file-input" accept=".geojson,.json" @change="handleFileUpload">
                    <input v-model="mapName" type="text" class="map-name-input" placeholder="Nome do mapa">
                    <select v-model="currentProject" class="map-name-input" :disabled="mapName == ''">
                        <option value="">Selecione uma pasta</option>
                        <option v-for="(project, index) in savedProjects" :key="index"
                            :value="{ projectId: project.id, index }"> {{
                                project.name }} </option>
                    </select>
                    <div class="map-row-btns">
                        <button class="save-btn" @click="handleSaveMap">Salvar</button>
                        <button class="clear-btn" @click="handleClearMap(true)">Limpar</button>
                    </div>
                </div>
                <div class="saved-projects-section">
                    <div class="saved-projects-title">
                        <h3 class="section-title">Meus Projetos</h3>
                        <IconAdd @click="handleNewProject" />
                    </div>
                    <input v-if="newProject" v-model="projectName" type="text" class="project-name-input"
                        placeholder="Novo Projeto" @keydown="handleSaveNewProject">
                    <ul class="saved-projects">
                        <li class="project-item-list" v-for="(project, i) in savedProjects" :key="i">
                            <div class="project-item">
                                <p>{{ project.name }}</p>
                                <IconArrow :class="project.maps ? 'transform-svg' : ''"
                                    @click="handleLoadUserMaps(project.id, i)" />
                            </div>
                            <ul class="saved-maps">
                                <li v-for="(map, j) in project.maps" :key="j" class="map-item">
                                    <p>{{ map.name }}</p>
                                    <input type="checkbox" name="select-map" :id="`select-map-${map.id}`"
                                        @change="loadSavedMap(map)">
                                </li>
                            </ul>
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

.saved-projects-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
}

.saved-projects-title h3 {
    margin: 0;
}

.saved-projects-title svg {
    height: 25px;
    width: 25px;
    cursor: pointer;
    stroke: red;
}

.saved-projects-title svg:hover {
    height: 25px;
    width: 25px;
    cursor: pointer;
    border: 2px solid #4caf50;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.project-name-input {
    width: 100%;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border-radius: 4px;
    border: none;
}

.project-item-list {
    display: flex;
    flex-direction: column;
}

.project-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding: 0.5rem 0 0.5rem 0;
    transition: background-color 0.2s;
    cursor: pointer;
}

.project-item p {
    font-size: 14px;
}

.transform-svg {
    transform: rotate(180deg);
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

.saved-projects {
    list-style: none;
}

.map-container {
    display: flex;
    flex: 1;
    height: calc(100vh - 68px);
}

.map-controls {
    margin-bottom: 1.5rem;
}

.map-item {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
}

.map-item p {
    font-size: 14px;
}

.map-item input {
    height: 15px;
    width: 15px;
    cursor: pointer;
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
    background: transparent;
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
    color: #3e8e41;
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