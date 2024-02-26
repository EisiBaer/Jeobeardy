<script setup>
import { ref } from 'vue';

import { useUserStore } from "@/stores/UserStore";
import GenericMultiButtonModal from '@/components/views/GenericMultiButtonModal.vue';
import { openModal } from "@/services/util";
import ProfilePicture from '@/components/blocks/ProfilePicture.vue';


let uploadedFileObj = ref(null);
let uploadingInProcess = ref(false);
let imageInput = ref(null);

const userStore = useUserStore();

function newImageUploaded( event ){
    let files = event.target.files || event.dataTransfer.files;
    if (!files.length){
        return;
    }
    let fileObj = {
        data: files[0],
        url: URL.createObjectURL( files[0] ),
    };
    uploadedFileObj.value = fileObj;
}

function saveProfilePicture(){
    if( uploadedFileObj.value === null || uploadingInProcess.value === true ){
        return;
    }
    uploadingInProcess.value = true;
    userStore.saveProfilePicture( uploadedFileObj.value.data )
    .finally( () => {
        uploadingInProcess.value = false;
        resetUploadedFileObj();
    })
}

function deleteProfilePicture(){
    openModal('confirmDeletePfpModal');
}

function resetUploadedFileObj(){
    uploadedFileObj.value = null;
    imageInput.value.value = null;
}

function handleModalButtonClick( buttonIndex ){
  switch( buttonIndex ){
    case 0:
        userStore.deleteProfilePicture()
        .finally( () => {
            uploadedFileObj.value = null;
        })
      break;
    case 1:
    default:
      return;
  }
}

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
        <div class="col-auto">
            <ProfilePicture
                :srcOverride="(uploadedFileObj !== null ? uploadedFileObj.url : null )"
                :isPreview="uploadedFileObj !== null"
                @previewDiscarded="resetUploadedFileObj()"
            />
        </div>
        <div class="col-auto border-start">
            <div class="h-100 d-flex flex-column justify-content-evenly">
                <div>
                    <label class="form-label fs-5" for="question-image">Upload new profile picture</label>
                    <input ref="imageInput" class="form-control bg-dark-blue" type="file" name="question-image" id="question-image" @change="newImageUploaded" accept="image/*">
                </div>
                <div>
                    <button class="btn btn-pink-accent-primary me-3" :disabled="uploadedFileObj === null" @click="saveProfilePicture">
				        <font-awesome-icon v-if="uploadingInProcess" icon="fa-solid fa-spinner" spin/>
				        <font-awesome-icon v-else icon="fa-solid fa-floppy-disk" />
                        Save
                    </button>
                    <button class="btn btn-danger" :disabled="userStore.pfpFilename === null" @click="deleteProfilePicture">
                        <font-awesome-icon icon="fa-solid fa-trash" />
                        Delete Current Profile Picture
                    </button>
                </div>
            </div>
        </div>
    </div>

    <GenericMultiButtonModal
      :id="'confirmDeletePfpModal'"
      :hasTitle="true"
      :title="'Are you sure?'"
      :modalText="'Are you sure you want to delete your current profile picture?'"
      :buttonList="[
        {
					text: 'Yes, delete!',
					emitsEvent: 'discardClicked',
					bgColorClass: 'btn-danger',
				},
				{
					text: 'Cancel',
					bgColorClass: 'btn-pink-accent-primary',
				},
      ]"
      @buttonClicked="handleModalButtonClick"
    />

</template>
