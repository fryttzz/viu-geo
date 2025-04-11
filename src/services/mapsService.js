import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebase"
import { useAuth } from "@/services/authService"

const { user } = useAuth()

const saveMap = async (mapName, currentGeoJSON) => {
    try {
        const newFeatureColletion = await addDoc(collection(db, "users", user.value.uid, "maps"), {
            userId: user.value.uid,
            name: mapName.value,
            crs: currentGeoJSON.value.crs ? currentGeoJSON.value.crs : {
                "type": "name",
                "properties": {
                    "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
                }
            },
            type: currentGeoJSON.value.type,
            createdAt: new Date()
        });

        currentGeoJSON.value.features.forEach(feature => {
            saveFeatures(newFeatureColletion.id, feature)
        });

    } catch (error) {
        console.error("Erro ao salvar o mapa:", error);
    }
}

const saveFeatures = async (featureCollectionId, data) => {
    try {
        await addDoc(collection(db, "users", user.value.uid, "maps", featureCollectionId, "features"), {
            mapId: featureCollectionId,
            data: JSON.stringify(data),
            createdAt: new Date()
        });
    } catch (error) {
        console.error("Erro ao salvar a Feature:", error);
    }
}

const loadUserMaps = async () => {
    try {
        const q = query(collection(db, "users", user.value.uid, "maps"));

        const querySnapshot = await getDocs(q);
        const savedMaps = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            savedMaps.push({
                id: doc.id,
                name: data.name,
                crs: data.crs,
                type: data.type,
            });
        });

        return savedMaps
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
    }
}

const getMapFeatures = async (mapData) => {
    try {
        const q = query(collection(db, "users", user.value.uid, "maps", mapData.id, "features"));

        const querySnapshot = await getDocs(q);
        const savedFeatures = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            savedFeatures.push({
                ...JSON.parse(data.data)
            });
        });

        return { id: mapData.id, name: mapData.name, crs: mapData.crs, type: mapData.type, features: savedFeatures }
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
    }
}

export { saveMap, loadUserMaps, getMapFeatures }