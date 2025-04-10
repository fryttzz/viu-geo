import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "@/firebase"
import { useAuth } from "@/services/authService"

const { user } = useAuth()

const saveMap = async (mapName, currentGeoJSON) => {
    try {
        await addDoc(collection(db, "users", user.value.uid, "maps"), {
            userId: user.value.uid,
            name: mapName.value,
            geojson: JSON.stringify(currentGeoJSON.value),
            createdAt: new Date()
        });
    } catch (error) {
        console.error("Erro ao salvar o mapa:", error);
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
                geojson: JSON.parse(data.geojson)
            });
        });

        return savedMaps
    } catch (error) {
        console.error("Erro ao carregar mapas:", error);
    }
}

export { saveMap, loadUserMaps }