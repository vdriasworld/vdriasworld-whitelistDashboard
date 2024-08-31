<script setup>
import { ref } from 'vue';
import { onBeforeUnmount, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import Navbar from "@/examples/PageLayout/Navbar.vue";
import ArgonInput from "@/components/ArgonInput.vue";
import ArgonSwitch from "@/components/ArgonSwitch.vue";
import ArgonButton from "@/components/ArgonButton.vue";

const body = document.getElementsByTagName("body")[0];
const store = useStore();
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:19198/api/login', {
      email: email.value,
      password: password.value,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    } else {
      console.error('Error logging in:', response.data);
    }
  } catch (error) {
    console.error('Error logging in:', error);
  }
};

onBeforeMount(() => {
  store.state.hideConfigButton = true;
  store.state.showNavbar = false;
  store.state.showSidenav = false;
  store.state.showFooter = false;
  body.classList.remove("bg-gray-100");
});

onBeforeUnmount(() => {
  store.state.hideConfigButton = false;
  store.state.showNavbar = true;
  store.state.showSidenav = true;
  store.state.showFooter = true;
  body.classList.add("bg-gray-100");
});
</script>

<template>
  <div class="container top-0 position-sticky z-index-sticky">
    <div class="row">
      <div class="col-12">
        <navbar
            isBlur="blur border-radius-lg my-3 py-2 start-0 end-0 mx-4 shadow"
            v-bind:darkMode="true"
            isBtn="bg-gradient-success"
        />
      </div>
    </div>
  </div>
  <main class="mt-0 main-content">
    <section>
      <div class="page-header min-vh-100">
        <div class="container">
          <div class="row">
            <div class="mx-auto col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0">
              <div class="card card-plain">
                <div class="pb-0 card-header text-start">
                  <h4 class="font-weight-bolder">Sign In</h4>
                  <p class="mb-0">Enter your email and password to sign in</p>
                </div>
                <div class="card-body">
                  <form role="form" @submit.prevent="handleLogin">
                    <div class="mb-3">
                      <argon-input
                          id="email"
                          type="email"
                          placeholder="Email"
                          v-model="email"
                          size="lg"
                      />
                    </div>
                    <div class="mb-3">
                      <argon-input
                          id="password"
                          type="password"
                          placeholder="Password"
                          v-model="password"
                          size="lg"
                      />
                    </div>
                    <argon-switch
                        id="rememberMe"
                        name="remember-me"
                        v-model="rememberMe"
                    >Remember me
                    </argon-switch
                    >
                    <div class="text-center">
                      <argon-button
                          class="mt-4"
                          variant="gradient"
                          color="success"
                          fullWidth
                          size="lg"
                          @click="handleLogin"
                      >Sign in
                      </argon-button
                      >
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div
                class="top-0 my-auto text-center col-6 d-lg-flex d-none h-100 pe-0 position-absolute end-0 justify-content-center flex-column">
              <div
                  class="position-relative bg-gradient-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center overflow-hidden"
                  style="
                  background-image: url('/background.jpg');
                  background-size: cover;
                "
              >
                <span class="mask" style="background-color: rgba(0, 0, 0, 0.2);"></span>
                <h4 class="mt-5 text-white font-weight-bolder position-relative">
                  "你今天打胶了吗？"
                </h4>
                <p class="text-white position-relative">
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
