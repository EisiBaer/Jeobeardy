<script setup>
import { useUserStore } from '@/stores/UserStore';

const userStore = useUserStore();

function logoutButtonClicked(_event){
  userStore.logout()
  .then( res => {
    if( res.data.success ){
      userStore.$reset();
    }else{
      console.debug( res );
    }
  })
  .catch( err => {
    console.debug(err);
  })
}

</script>

<template>
  <nav id="navbar" class="navbar navbar-dark navbar-expand-md bg-dark-blue text-light">
    <div class="container">
      <div class="d-md-none d-block">
        <RouterLink to="/">
          <img src="../../assets/icons/jeobeardy_logo.svg" alt="Logo" class="nav-logo my-1">
        </RouterLink>
      </div>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNavContainer"
        aria-controls="navbarNavContainer"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavContainer">
        <div class="navbar-nav w-100 justify-content-center align-items-center">
          <div class="row w-100">
            <div class="col-md-4 col-12 mb-md-0 mb-3">
              <div class="d-flex justify-content-md-end justify-content-center align-items-center h-100 fs-4">
                <RouterLink class="text-light text-decoration-none px-3" to="/">
                  Home
                </RouterLink>
              </div>
            </div>
            <div class="col-md-4 col-12 d-none d-md-inline">
              <div class="d-flex justify-content-center align-items-center h-100">
                <RouterLink to="/" class="text-center">
                  <img src="../../assets/icons/jeobeardy_logo.svg" alt="Logo" class="nav-logo my-1">
                </RouterLink>
              </div>
            </div>
            <div class="col-md-4 col-12 mb-md-0 mb-3">
              <div class="d-flex justify-content-md-start justify-content-center align-items-center h-100 fs-4">
                <RouterLink class="text-light text-decoration-none px-3" to="/about">
                  About
                </RouterLink>
              </div>
            </div>
            <div class="col-md-4 col-12 d-md-none d-inline mb-md-0 mb-3">
              <div class="d-flex justify-content-center align-items-center h-100 fs-4">
                <div v-if="userStore.loggedIn">
                  <div class="dropdown text-center">
                    <a class="dropdown-toggle text-decoration-none" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      {{ userStore.username }}
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-dark-blue">
                      <li>
                        <RouterLink class="dropdown-item" to="/profile">
                          Profile
                        </RouterLink>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                        <a class="dropdown-item" href="#" @click="logoutButtonClicked">Logout</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-else>
                  <RouterLink class="text-light text-decoration-none px-3" to="/login">
                    Login  
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="position-absolute end-0 top-50 translate-middle d-md-inline d-none">
          <div class="d-flex justify-content-start align-items-center h-100 fs-5">
            <div v-if="userStore.loggedIn">
              <div class="dropdown">
                <a class="dropdown-toggle text-decoration-none" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {{ userStore.username }}
                </a>
                <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark bg-dark-blue">
                  <li>
                    <RouterLink class="dropdown-item" to="/profile">
                      Profile
                    </RouterLink>
                  </li>
                  <li><hr class="dropdown-divider"></li>
                  <li>
                    <a class="dropdown-item" href="#" @click="logoutButtonClicked">Logout</a>
                  </li>
                </ul>
              </div>
            </div>
            <div v-else>
              <RouterLink class="text-light text-decoration-none px-3" to="/login">
                Login  
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.nav-logo{
  height: 3.75em;
}
</style>
