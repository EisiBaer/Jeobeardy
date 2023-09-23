import { createApp, markRaw } from "vue";
import { createPinia  } from "pinia";

import { FontAwesomeIcon, FontAwesomeLayers } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faDragon, faRightToBracket, faUsers, faUserPlus, faSpinner, faPlusSquare, faBorderAll, faPen, faTrash, faAngleDown, faAngleUp,
         faPlus, faMinus, faAngleRight, faSquare, faPlay, faCircleExclamation, faSquareCheck, faSquareMinus, faHandPointer, faFloppyDisk,
         faEye, faRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { faCircleUser, faSquarePlus } from "@fortawesome/free-regular-svg-icons";


import App from "./App.vue";
import router from "./router";

// Import our custom CSS
import "./assets/scss/styles.scss";

// Import all of Bootstrap's JS
import "bootstrap";

library.add({
  faDragon,
  faSquarePlus,
  faRightToBracket,
  faCircleUser,
  faUsers,
  faUserPlus,
  faSpinner,
  faPlusSquare,
  faBorderAll,
  faPen,
  faTrash,
  faAngleDown,
  faAngleUp,
  faPlus,
  faMinus,
  faAngleRight,
  faSquare,
  faSquareCheck,
  faSquareMinus,
  faPlay,
  faCircleExclamation,
  faHandPointer,
  faFloppyDisk,
  faEye,
  faRotateLeft,
});


const pinia = createPinia();

pinia.use( ( { store } ) => {
  store.router = markRaw(router);
});

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);
app.component('font-awesome-layers', FontAwesomeLayers);
app.use(pinia);
app.use(router);

app.directive('focus', {
  mounted: ( element ) => element.focus()
})

app.mount("#app");
