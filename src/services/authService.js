import { auth } from "@/firebase"; // Importa a instância do Firebase Auth
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { ref } from "vue";

const db = getFirestore();
const user = ref(null);

// Função para login com Google
export const loginWithGoogle = async () => {
   const provider = new GoogleAuthProvider();
   try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Verifica se o usuário já existe no Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
         // Se o usuário não existir, cria um novo registro no Firestore
         await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date()
         });
      }

      return user;
   } catch (error) {
      console.error("Erro no login com Google:", error.message);
      throw error;
   }
};

// Função para logout
export const logout = async () => {
   try {
      await signOut(auth);
      user.value = null;
   } catch (error) {
      console.error("Erro ao sair:", error.message);
   }
};

// Observa mudanças na autenticação
onAuthStateChanged(auth, (currentUser) => {
   user.value = currentUser;
});

export const useAuth = () => {
   return { user };
};
