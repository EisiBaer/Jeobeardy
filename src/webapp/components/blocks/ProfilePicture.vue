<script setup>
import { computed } from 'vue';

import { useUserStore } from "@/stores/UserStore"

const props = defineProps({
    srcOverride: {
        type: [String, null],
        default: null,
        required: false,
    },
    sizingClasses: {
        type: Array,
        default: () => ["pfp-sizing"],
        required: false,
    },
    isPreview: {
        type: Boolean,
        default: false,
        required: false,
    }
});

const emit = defineEmits(["previewDiscarded"]);

const userStore = useUserStore();
let protocol = ('https:' == document.location.protocol ? 'https://' : 'http://');
let hostname = window.location.hostname;
if( window.location.hostname.includes("localhost" ) ){
    hostname += ':3000';
}
const API_URL = `${protocol}${hostname}/api`;

const pfpSrc = computed( () => {
    if( props.srcOverride !== null ){
        return props.srcOverride;
    } else if( userStore.pfpFilename === null ){
        return "/src/webapp/assets/images/PFP_BearHead.svg";
    } else {
        return `${API_URL}/user/pfp/${userStore.pfpFilename}`;
    }
})


</script>

<template>
    <div>
        <div class="border border-1 border-white rounded-3 overflow-hidden">
            <img :src="pfpSrc" alt="Profile Picture of the user"  class="pfp" :class="sizingClasses" />
            <div v-show="props.isPreview" class="position-relative">
                <span class="position-absolute bottom-0 end-0 bg-black bg-opacity-50 px-1 rounded-2">
                    Preview
                    <font-awesome-icon icon="fa-solid fa-rotate-left" size="sm" @click="emit('previewDiscarded')" title="Discard uploaded image" class="pointer"/>
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.pfp-sizing{
    height: 10rem;
    width: 10rem;
    max-height: 100vh;
    max-width: 100vw;
}
.pfp-sizing-navbar{
  height: 2em;
  width: 2em;
}
</style>