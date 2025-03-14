<template>
  <div class="event-page">
    <h1>Event Details Page</h1>

    <!-- بررسی مقداردهی اولیه -->
    <p v-if="eventData">✅ Data Loaded: {{ eventData.title }}</p>
    <p v-else>❌ Loading...</p>

    <!-- نمایش تستی اطلاعات رویداد -->
    <pre>{{ eventData }}</pre>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const eventId = route.params.id;

const eventData = ref(null);

const fetchEventDetails = async () => {
  eventData.value = {
    id: eventId,
    title: "Test Event",
    description: "A test event for debugging...",
    image: "",
    creator: "User123",
    tags: "#Debug #Test",
    participants: 10,
    prize: "1000 SPARKS",
    time_left: 7, // مقدار فقط به صورت عدد
  };
};

onMounted(fetchEventDetails);
</script>

<style scoped>
.event-page {
  background: #b3c8cf;
  min-height: 100vh;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
