<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

</script>

<template>
  <div class="container pt-5">
    <div class="row pt-3">
      <div class="col">
        <h1 class="text-center">What is Jeobeardy?</h1>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <div class="d-flex h-100 justify-content-evenly align-items-top w-100">
          <div class="d-flex flex-column w-100 m-5 justify-content-start align-items-center fs-3">
            <span>
              Jeobeardy is very similiar to Jeopardy.
            </span>
            <span>
              But for you!
            </span>
            <span>
              To play with your Friends!
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col">
        <div class="d-flex flex-column h-100 justify-content-center align-items-center w-100 pt-5 border-top border-light">
          <h4>
            Privacy Policy
          </h4>
          <p class="mb-0">
            Jeobeardy's privacy policy is really simple: we don't collect or store any of your data, or track your usage in any way.
          </p>
          <p class="mb-0">
            Only cookies that are essential to run the site are used.
          </p>
        </div>
      </div>
    </div>
    <div class="row mt-5 mb-3">
      <div class="col">
        <div class="d-flex flex-column h-100 justify-content-center align-items-center w-100 pt-5 border-top border-light">
          <h4>
            Contact
          </h4>
          <p class="mb-0">
            e-mail:
            <a href="mailto:jeobeardy@proton.me">
              jeobeardy@proton.me
            </a>
          </p>
          <p class="mb-0">
            Source Code:
            <a href="https://github.com/EisiBaer/Jeobeardy" target="_blank">
              GitHub
            </a>
          </p>
          <p class="mb-0">
            License:
            <a href="https://www.gnu.org/licenses/gpl-3.0.html" target="_blank">
              GNU General Public License v3 (GPL-3)
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-card {
  height: 20rem;
  width: 25rem;
}
</style>
