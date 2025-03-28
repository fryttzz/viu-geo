<script setup>
import { logout, useAuth } from "@/services/authService";
import { useRouter } from "vue-router";

const router = useRouter();
const { user } = useAuth()

const handleLogout = async () => {
    try {
        await logout();
        router.push({ name: "Login" })
        // setNotification("success", "Você foi desconectado com sucesso")
    } catch (error) {
        console.error("Erro ao desconectar sua conta Google:", error.message);
    }
}
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