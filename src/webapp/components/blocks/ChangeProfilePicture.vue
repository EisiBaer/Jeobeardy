<script setup>
import { ref } from 'vue';


const emit = defineEmits(["profilePictureChanged"]);

let uploadedFileUrl = ref(null);


function newImageUploaded( event ){
    let files = event.target.files || event.dataTransfer.files;
    if (!files.length){
        return;
    }
    let fileObj = {
        data: files[0],
        url: URL.createObjectURL( files[0] ),
    };
    uploadedFileUrl.value = fileObj;
}

function revealAnswer(){
    emit("profilePictureChanged");
}

revealAnswer();

</script>

<template>
    <div class="row">
        <div class="col">
            <h3>
                Profile Picture
            </h3>
        </div>
    </div>
    <div class="row">
        <div class="col-2">
            <div class="ratio ratio-16x9">
                <img src="" alt="Current Profile Picture">
            </div>
        </div>
        <div class="col">
            <div class="row">
                <div class="col">
                    <img src="" alt="Standard Profile Picture">
                </div>
            </div>
            <div>
                <label class="form-label fs-4 mt-3" for="question-image">Upload new profile picture</label>
                <input class="form-control bg-dark-blue" type="file" name="question-image" id="question-image" @change="newImageUploaded( questionIndex, $event )" accept="image/*">
            </div>
        </div>
    </div>
</template>

<style scoped></style>
