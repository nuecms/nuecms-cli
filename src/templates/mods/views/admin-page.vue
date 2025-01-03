<template>
  <div class="userProfile">
    <h1>User Profile Page</h1>
    <p>User Information Management Page</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const title = ref('User Profile Page');
</script>

<style scoped>
.userProfile {
  padding: 20px;
  background-color: #f9f9f9;
}

.userProfile h1 {
  color: #333;
}

.userProfile p {
  color: #666;
}
</style>
