<script setup>
import { computed } from 'vue';

import defaultPfp from '@/assets/images/PFP_BearHead.svg';
import { useUserStore } from "@/stores/UserStore"

const props = defineProps({
    srcOverride: {
        type: [String, null],
        default: null,
        required: false,
    },
    sizing: {
        type: String,
        default: "10rem",
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

</script>

<template>
    <div>
        <div class="border border-1 border-white rounded-3 overflow-hidden" :style="[ { 'width': props.sizing }, { 'height': props.sizing } ]" >
            <img v-if="props.srcOverride !== null" :src="props.srcOverride" alt="Profile Picture of the user"  class="pfp" :style="[ { 'width': props.sizing }, { 'height': props.sizing } ]" />
            <img v-else-if="userStore.pfpFilename === null" :src="defaultPfp" alt="Profile Picture of the user"  class="pfp" :style="[ { 'width': props.sizing }, { 'height': props.sizing } ]" />
            <img v-else :src="`${API_URL}/user/pfp/${userStore.pfpFilename}`" alt="Profile Picture of the user"  class="pfp" :style="[ { 'width': props.sizing }, { 'height': props.sizing } ]" />
            <div v-show="props.isPreview" class="position-relative">
                <span class="position-absolute bottom-0 end-0 bg-black bg-opacity-50 px-1 rounded-2">
                    Preview
                    <font-awesome-icon icon="fa-solid fa-rotate-left" size="sm" @click="emit('previewDiscarded')" title="Discard uploaded image" class="pointer"/>
                </span>
            </div>
        </div>
    </div>
</template>