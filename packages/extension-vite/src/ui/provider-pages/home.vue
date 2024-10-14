<template>
  <div class="row">
    <div class="col-12">
      <div id="nav">
        <li v-for="route in routes" :key="route.path">
          <router-link :to="route.path">
            {{ route.name }}
          </router-link>
        </li>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import routes from "./routes";
</script>
