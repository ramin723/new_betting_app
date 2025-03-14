<template>
  <nav class="bottom-nav">
    <button
      v-for="(item, index) in navItems"
      :key="index"
      :class="{ active: isActive(item.link) }"
      @click="navigate(item.link)"
    >
      <span>{{ item.icon }}</span>
      <p>{{ item.label }}</p>
    </button>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const navItems = ref([
  { label: "رویدادها", icon: "🏆", link: "/" },
  { label: "وظایف", icon: "📋", link: "/tasks" },
  { label: "رتبه‌بندی", icon: "🏅", link: "/leaderboard" },
  { label: "برنامه‌ها", icon: "📱", link: "/apps" },
  { label: "پروفایل", icon: "👤", link: "/profile" }
]);

const isActive = (link) => {
  return route.path === link;
};

const navigate = async (link) => {
  try {
    await router.push(link);
  } catch (err) {
    console.error('Navigation error:', err);
  }
};
</script>

<style scoped>
.bottom-nav {
  display: flex;
  justify-content: space-around;
  padding: 8px;
  background: #fff;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  left: 50%;
  transform: translateX(-50%);
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  z-index: 100;
}

.bottom-nav button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px;
  background: none;
  border: none;
  color: #457B9D;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 64px;
}

.bottom-nav button span {
  font-size: 20px;
}

.bottom-nav button p {
  margin: 0;
}

.bottom-nav button.active {
  color: #E63946;
}
</style>
