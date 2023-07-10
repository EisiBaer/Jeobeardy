import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores/UserStore";
import { useGameStore } from "@/stores/GameStore";
import { GAME_STATES } from "@/services/GameService";
import Home from "@/components/pages/Home.vue";
import Lobby from "@/components/pages/Lobby.vue";
import Join from "@/components/pages/Join.vue";
import Game from "@/components/pages/Game.vue";
import Create from "@/components/pages/Create.vue";
import Login from "@/components/pages/Login.vue";
import Signup from "@/components/pages/Signup.vue";
import About from "@/components/pages/About.vue";
import Profile from "@/components/pages/Profile.vue";

const TEST_WOUT_WEBSOCKET = false;

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Home,
      meta: { requiresAuth: false },
    },
    {
      path: "/about",
      name: "about",
      component: About,
      meta: { requiresAuth: false },
    },
    {
      path: "/lobby/:gameId",
      name: "gameLobby",
      component: Lobby,
      meta: { requiresAuth: false },
      beforeEnter: async (to, from)=>{
        const gameStore = useGameStore();
        if( gameStore.websocketConnection instanceof WebSocket ){
          return true;
        } else {
          return false;
        }
      }
    },
    {
      path: "/join",
      name: "joinGame",
      component: Join,
      meta: { requiresAuth: false },
      beforeEnter: async (to, from)=>{
        const gameStore = useGameStore();
        if( gameStore.gameState === GAME_STATES.INIT ){
          return true;
        } else {
          return false;
        }
      }
    },
    {
      path: "/join/:gameId",
      name: "joinExistingGame",
      component: Join,
      meta: { requiresAuth: false },
    },
    {
      path: "/game/:gameId",
      name: "gameWithGameId",
      component: Game,
      meta: { requiresAuth: false },
      beforeEnter: async (to, from)=>{
        console.debug("about to enter /game/:gameId");
        if( TEST_WOUT_WEBSOCKET ){
          return true;
        }
        const gameStore = useGameStore();
        if( gameStore.websocketConnection instanceof WebSocket ){
          return true;
        } else {
          return { name: "joinExistingGame", params: { gameId: to.params.gameId } };
        }
      }
    },
    {
      path: "/create/:boardId",
      name: "createBoardWithParams",
      component: Create,
      meta: { requiresAuth: true },
      props: true,
    },
    {
      path: "/create",
      name: "createBoard",
      component: Create,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/signup",
      name: "signup",
      component: Signup,
      meta: { requiresAuth: false },
    },
    {
      path: "/profile",
      name: "profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach( async ( to, from ) => {
  const canAccess = await canUserAccess(to);
  if (!canAccess) return '/login';
});

async function canUserAccess( to ){
  if( to.meta.requiresAuth && !["login", "signup"].includes( to.name ) ){
    const userStore = useUserStore();
    try{
      await userStore.initialUserPromise;
      return userStore.loggedIn;
    } catch (err){
      return userStore.loggedIn;
    }
  } else {
    return true;
  }
}

export default router;
