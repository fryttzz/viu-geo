<script setup>
import { useNotification } from "@/stores/notificationStore";

import IconClose from './icons/IconClose.vue';
import IconOk from "./icons/IconOk.vue";
import IconWarning from "./icons/IconWarning.vue";

const notificationStore = useNotification()

const hideNotification = async () => {
    notificationStore.closeNotification()
}

addEventListener('animationend', () => {
    hideNotification()
})

</script>

<template>
    <div v-if="notificationStore.toBeDisplayed" class="notification-container">
        <div class="notification-content">
            <IconOk v-if="notificationStore.type === 'success'" class="notify-ok" />
            <IconWarning v-else-if="notificationStore.type === 'warning'" class="notify-warning" />
            <IconClose v-else-if="notificationStore.type === 'error'" class="notify-error" />
            <span>{{ notificationStore.message }}</span>
            <button class="close-notify-btn" @click="hideNotification">
                <IconClose />
            </button>
        </div>
    </div>
</template>

<style scoped>
.notification-container {
    position: fixed;
    bottom: 0;
    left: 0;
    height: 60px;
    width: 100%;
    display: flex;
    justify-content: center;
    z-index: 2000;
    animation: slideUpDown 4s ease-in-out;
}

.notification-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    background: white;
    width: 100%;
    padding: 16px;
    box-shadow: 0 -6px 10px rgba(136, 136, 136, 0.5);
    font-size: 1rem;
    position: relative;
    cursor: default;
}

.notification-content span {
    text-align: center;
    color: #333;
    margin-left: 16px;
}

.close-notify-btn {
    position: fixed;
    width: 35px;
    height: 35px;
    right: 0;
    margin-right: 16px;
    background: transparent;
    border: none;
    border-radius: 100%;
    cursor: pointer;
}

.close-notify-btn:hover {
    background: 333;
}

.close-notify-btn svg {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
}

.close-notify-btn svg * {
    stroke: #333;
}

svg.notify-ok {
    fill: #333;
    height: 30px;
    width: 30px;
}

svg.notify-warning {
    fill: #ec9d0a;
    height: 30px;
    width: 30px;
}

svg.notify-error {
    background: #d60f0f;
    border-radius: 100%;
    height: 30px;
    width: 30px;
}

@keyframes slideUpDown {
    0% { bottom: -100px; }
    10% { bottom: 0px; }
    80% { bottom: 0px; }
    100% { bottom: -100px; }
}

</style>