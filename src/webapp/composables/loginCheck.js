// mouse.js
import { watch } from 'vue'

import { useUserStore } from '@/stores/UserStore';
import { useRouter } from 'vue-router';

export function useLoginCheck() {

  const router = useRouter();
  const userStore =  useUserStore();

  watch(
    () => userStore.loggedIn,
    ( newVal ) => {
      if( newVal === false ){
        router.push( "/" );
      }
    }
  );
}
