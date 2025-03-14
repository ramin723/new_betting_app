<template>
  <div class="category-tabs-container">
    <!-- ردیف تگ‌های اصلی -->
    <div class="category-tabs main-tabs">
      <div v-if="pending" class="loading">در حال بارگذاری...</div>
      <template v-else-if="error">
        <div class="error">خطا در دریافت دسته‌بندی‌ها</div>
      </template>
      <template v-else>
        <!-- دکمه All -->
        <button
          :class="['tab-button', { active: selectedCategory === null }]"
          @click="selectCategory(null)"
        >
          🌟 همه
        </button>
        
        <!-- دسته‌بندی‌های اصلی -->
        <button
          v-for="category in mainCategories"
          :key="category.id"
          :class="['tab-button', { active: category.id === selectedCategory }]"
          @click="selectCategory(category.id)"
        >
          {{ getEmoji(category.name) }} {{ category.name }}
        </button>
      </template>
    </div>

    <!-- ردیف تگ‌های زیرشاخه -->
    <div v-if="selectedCategory && subTags.length > 0" class="category-tabs sub-tabs">
      <button
        v-for="subTag in subTags"
        :key="subTag.id"
        :class="['tab-button sub-tag', { active: selectedSubTags.includes(subTag.id) }]"
        @click="toggleSubTag(subTag.id)"
      >
        {{ getEmoji(subTag.name) }} {{ subTag.name }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  selectedCategory: {
    type: [String, Number],
    default: null
  }
});

const emit = defineEmits(['update:selectedCategory', 'update:selectedSubTags']);

// دریافت تگ‌های اصلی از API
const { data: tagsResponse, pending, error } = await useFetch('/api/tags', {
  key: 'main-categories',
  transform: (response) => {
    console.log('Raw tags response:', response);
    return response;
  }
});

// محاسبه تگ‌های اصلی
const mainCategories = computed(() => {
  console.log('Computing main categories from:', tagsResponse.value);
  if (!tagsResponse.value?.tags) return [];
  return tagsResponse.value.tags.filter(tag => !tag.parent_id);
});

// محاسبه تگ‌های زیرشاخه برای تگ اصلی انتخاب شده
const subTags = computed(() => {
  if (!props.selectedCategory || !tagsResponse.value?.tags) return [];
  return tagsResponse.value.tags.filter(tag => tag.parent_id === props.selectedCategory);
});

// تگ‌های زیرشاخه انتخاب شده
const selectedSubTags = ref([]);

// تابع کمکی برای اضافه کردن ایموجی به هر دسته
const getEmoji = (categoryName) => {
  const emojiMap = {
    'Battles': '🔥',
    'TON/Crypto': '💰',
    'Sport': '⚽',
    'Esports': '🎮',
    'Football': '⚽',
    'Crypto': '💎',
    'Bitcoin': '₿',
    'CS:GO': '🎯',
    'Meme coins': '🐕',
  };
  return emojiMap[categoryName] || '📌';
};

// انتخاب دسته‌بندی اصلی
const selectCategory = (categoryId) => {
  console.log('Selected category:', categoryId);
  // پاک کردن تگ‌های زیرشاخه انتخاب شده هنگام تغییر دسته‌بندی اصلی
  selectedSubTags.value = [];
  emit('update:selectedCategory', categoryId);
  emit('update:selectedSubTags', []);
};

// toggle کردن تگ زیرشاخه
const toggleSubTag = (subTagId) => {
  const index = selectedSubTags.value.indexOf(subTagId);
  if (index === -1) {
    selectedSubTags.value.push(subTagId);
  } else {
    selectedSubTags.value.splice(index, 1);
  }
  emit('update:selectedSubTags', selectedSubTags.value);
};
</script>

<style scoped>
.category-tabs-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  background-color: #F1FAEE;
  padding: 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(29, 53, 87, 0.1);
}

.category-tabs {
  display: flex;
  overflow-x: auto;
  background: #F1FAEE;
  padding: 4px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  min-height: 50px;
  gap: 8px;
  white-space: nowrap;
  padding-bottom: 8px;
}

.category-tabs::-webkit-scrollbar {
  height: 6px;
  display: block;
}

.category-tabs::-webkit-scrollbar-track {
  background: #A8DADC;
  border-radius: 3px;
}

.category-tabs::-webkit-scrollbar-thumb {
  background: #457B9D;
  border-radius: 3px;
}

.category-tabs::-webkit-scrollbar-thumb:hover {
  background: #1D3557;
}

.tab-button {
  padding: 8px 16px;
  background: #F1FAEE;
  border: 1px solid #457B9D;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;
  border-radius: 20px;
  color: #457B9D;
  flex-shrink: 0;
}

.tab-button:hover {
  background: #A8DADC;
  transform: translateY(-1px);
}

.tab-button.active {
  font-weight: bold;
  background: #457B9D;
  color: #F1FAEE;
  border-color: #457B9D;
  box-shadow: 0 2px 4px rgba(69, 123, 157, 0.2);
}

.sub-tag {
  font-size: 13px;
  padding: 6px 12px;
  background: #F1FAEE;
  border: 1px solid #A8DADC;
  color: #457B9D;
}

.sub-tag:hover {
  background: #A8DADC;
}

.sub-tag.active {
  background: #E63946;
  color: #F1FAEE;
  border-color: #E63946;
}

.loading, .error {
  padding: 10px;
  text-align: center;
  width: 100%;
  color: #457B9D;
}

.error {
  color: #E63946;
}
</style>
  