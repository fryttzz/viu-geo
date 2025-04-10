<script setup>
import { loginWithGoogle } from "@/services/authService";
import { useRouter } from "vue-router";
import IconGoogle from '@/assets/IconGoogle.vue'

const router = useRouter();

const handleSignIn = async () => {
    await loginWithGoogle()
        .then(() => {
            router.push({ name: "Início" })
        }).catch((error) => {
            console.error("Erro ao autenticar com Google:", error.message);
        })
}
</script>

<template>
    <div id="login-page">
        <div class="login-container">
            <h1 class="login-title">ViuGeo</h1>
            <p>Ferramenta para visualização de arquivos GeoJSON</p>
            <button class="google-btn" @click="handleSignIn">
                <IconGoogle />
                Entrar com uma conta Google
            </button>
        </div>
    </div>
</template>

<style scoped>
#login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 10px 25px rgba(163, 144, 144, 0.1);
    width: 90%;
    max-width: 400px;
    text-align: center;
}

.login-title {
    color: #333;
    margin-bottom: 1.5rem;
}

.google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    color: #757575;
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 0.8rem 1rem;
    font-size: 14px;
    font-weight: 500;
    width: 100%;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-top: 16px;
}

.google-btn:hover {
    background-color: #f5f5f5;
}

.google-icon {
    margin-right: 10px;
    height: 18px;
}
</style>