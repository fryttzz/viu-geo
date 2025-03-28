import { defineStore } from "pinia";

export const useNotification = defineStore('NotificationStore', {
    state() {
        return {
            toBeDisplayed: false,
            message: 'message from the store',
            type: 'success'
        }
    },
    actions: {
        setNotification(type, message) {
            this.message = message
            this.type = type
            this.toBeDisplayed = true
        },
        closeNotification() {
            this.toBeDisplayed = false
        }
    }
})