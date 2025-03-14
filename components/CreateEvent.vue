<template>
  <div class="create-event">
    <!-- Info Alert -->
    <div class="info-alert">
      <h4>Tips for Faster Event Approval:</h4>
      <ul>
        <li>Provide complete and accurate information</li>
        <li>Include reliable sources and references</li>
        <li>Select relevant tags</li>
        <li>Add an appropriate event image</li>
      </ul>
    </div>

    <form @submit.prevent="handleSubmit" class="event-form">
      <!-- Main Information -->
      <div class="form-section">
        <h3>Basic Information</h3>
        <div class="form-group">
          <label>Event Title</label>
          <input 
            v-model="formData.title" 
            type="text" 
            required
            placeholder="Example: World Cup Final Result"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="formData.description" 
            rows="4"
            placeholder="Describe the event details..."
          ></textarea>
        </div>

        <div class="form-group">
          <label>Event Type</label>
          <select v-model="formData.event_type" @change="handleEventTypeChange">
            <option value="yes_no">Yes/No</option>
            <option value="winner">Winner/Loser</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div class="form-group">
          <label>Main Question</label>
          <div v-if="formData.event_type === 'yes_no'" class="question-template">
            <span>Will</span>
            <input 
              v-model="formData.subject"
              type="text"
              required
              placeholder="subject"
              class="inline-input"
            />
            <span>happen before</span>
            <input 
              v-model="formData.deadline"
              type="datetime-local"
              required
              class="inline-input"
            />
            <span>?</span>
          </div>
          <div v-else-if="formData.event_type === 'winner'" class="question-template">
            <span>Who will win?</span>
            <input 
              v-model="formData.option1"
              type="text"
              required
              placeholder="option 1"
              class="inline-input"
            />
            <span>or</span>
            <input 
              v-model="formData.option2"
              type="text"
              required
              placeholder="option 2"
              class="inline-input"
            />
          </div>
          <div v-else>
            <input 
              v-model="formData.question" 
              type="text"
              required
              placeholder="Enter your custom question"
            />
          </div>
        </div>
      </div>

      <!-- Timing -->
      <div class="form-section">
        <h3>Timing</h3>
        <div class="form-row">
          <div class="form-group">
            <label>Display Start</label>
            <input 
              v-model="formData.start_time" 
              type="datetime-local"
              required
            />
          </div>
          <div class="form-group">
            <label>Display End</label>
            <input 
              v-model="formData.end_time" 
              type="datetime-local"
              required
            />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Betting Deadline</label>
            <input 
              v-model="formData.betting_deadline" 
              type="datetime-local"
              required
            />
          </div>
          <div class="form-group">
            <label>Result Time</label>
            <input 
              v-model="formData.result_time" 
              type="datetime-local"
              required
            />
          </div>
        </div>
      </div>

      <!-- Betting Options -->
      <div class="form-section">
        <h3>Betting Options</h3>
        <div class="options-info">
          <p>Make sure to include all possible outcomes to ensure a definitive result.</p>
        </div>
        <div 
          v-for="(option, index) in formData.options" 
          :key="index"
          class="option-item"
        >
          <div class="form-row">
            <div class="form-group">
              <label>Option Text</label>
              <input 
                v-model="option.text" 
                type="text"
                required
                :placeholder="'Option ' + (index + 1)"
              />
            </div>
            <div class="form-group">
              <label>Initial Odds</label>
              <input 
                v-model.number="option.odds" 
                type="number"
                step="0.1"
                min="1"
                required
              />
              <small class="help-text">Can be adjusted by admin</small>
            </div>
            <button 
              type="button"
              class="remove-btn"
              @click="removeOption(index)"
              v-if="formData.options.length > 2"
            >
              ✕
            </button>
          </div>
        </div>
        <button 
          type="button"
          class="add-btn"
          @click="addOption"
        >
          + Add Option
        </button>
      </div>

      <!-- Tags -->
      <div class="form-section">
        <h3>Tags</h3>
        <div class="tags-section">
          <div class="predefined-tags">
            <h4>Popular Tags</h4>
            <div class="tag-categories">
              <div v-for="category in tagCategories" :key="category.name" class="tag-category">
                <h5>{{ category.name }}</h5>
                <div class="tag-options">
                  <label v-for="tag in category.tags" :key="tag" class="tag-checkbox">
                    <input 
                      type="checkbox" 
                      :value="tag"
                      v-model="formData.tags"
                    />
                    {{ tag }}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="custom-tags">
            <h4>Suggest New Tag</h4>
            <div class="tags-input">
              <div class="selected-tags">
                <span 
                  v-for="tag in formData.customTags" 
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                  <button 
                    type="button"
                    class="remove-tag"
                    @click="removeCustomTag(tag)"
                  >
                    ✕
                  </button>
                </span>
              </div>
              <input 
                v-model="tagInput"
                @keydown.enter.prevent="addCustomTag"
                type="text"
                placeholder="Type and press Enter to add custom tag"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div class="form-section">
        <h3>Additional Information</h3>
        <div class="form-group">
          <label>Reference Event</label>
          <input 
            v-model="formData.reference_event" 
            type="text"
            placeholder="Example: FIFA World Cup 2024"
          />
        </div>
        <div class="form-group">
          <label>Reference Link</label>
          <input 
            v-model="formData.reference_link" 
            type="url"
            placeholder="https://example.com"
          />
        </div>
        <div class="form-group">
          <label>Event Image</label>
          <input 
            type="file" 
            @change="handleImageUpload" 
            accept="image/*"
          />
          <small class="help-text">Recommended size: 1200x630px</small>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="$emit('cancel')">
          Cancel
        </button>
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Create Event' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';

const emit = defineEmits(['submit', 'cancel']);

const isSubmitting = ref(false);
const tagInput = ref('');

// Predefined tag categories
const tagCategories = [
  {
    name: 'Sports',
    tags: ['Football', 'Basketball', 'Tennis', 'ESports', 'Olympics']
  },
  {
    name: 'Entertainment',
    tags: ['Movies', 'Music', 'TV Shows', 'Awards']
  },
  {
    name: 'Politics',
    tags: ['Elections', 'International', 'Economy']
  },
  {
    name: 'Technology',
    tags: ['Crypto', 'AI', 'Startups']
  }
];

const formData = reactive({
  title: '',
  description: '',
  event_type: 'yes_no',
  subject: '',
  deadline: '',
  option1: '',
  option2: '',
  question: '',
  start_time: '',
  end_time: '',
  betting_deadline: '',
  result_time: '',
  options: [
    { text: 'Yes', value: 'yes', odds: 2.0 },
    { text: 'No', value: 'no', odds: 2.0 }
  ],
  tags: [],
  customTags: [],
  reference_event: '',
  reference_link: '',
  image: null
});

const handleEventTypeChange = () => {
  // Reset options based on event type
  if (formData.event_type === 'yes_no') {
    formData.options = [
      { text: 'Yes', value: 'yes', odds: 2.0 },
      { text: 'No', value: 'no', odds: 2.0 }
    ];
  } else if (formData.event_type === 'winner') {
    formData.options = [
      { text: '', value: 'option_1', odds: 2.0 },
      { text: '', value: 'option_2', odds: 2.0 }
    ];
    formData.option1 = '';
    formData.option2 = '';
  }
};

const addOption = () => {
  formData.options.push({
    text: '',
    value: `option_${formData.options.length + 1}`,
    odds: 2.0
  });
};

const removeOption = (index) => {
  formData.options.splice(index, 1);
};

const addCustomTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !formData.customTags.includes(tag)) {
    formData.customTags.push(tag);
    tagInput.value = '';
  }
};

const removeCustomTag = (tag) => {
  const index = formData.customTags.indexOf(tag);
  if (index > -1) {
    formData.customTags.splice(index, 1);
  }
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.image = file;
  }
};

const validateForm = () => {
  // Check dates
  const now = new Date();
  const start = new Date(formData.start_time);
  const end = new Date(formData.end_time);
  const betting = new Date(formData.betting_deadline);
  const result = new Date(formData.result_time);

  if (start > end) {
    throw new Error('Start time cannot be after end time');
  }

  if (betting > result) {
    throw new Error('Betting deadline cannot be after result time');
  }

  if (betting < now) {
    throw new Error('Betting deadline cannot be in the past');
  }

  // Check options
  if (formData.options.length < 2) {
    throw new Error('At least two options are required');
  }

  for (const option of formData.options) {
    if (!option.text || !option.odds || option.odds < 1) {
      throw new Error('Please complete all option details');
    }
  }

  // Format question based on event type
  if (formData.event_type === 'yes_no') {
    formData.question = `Will ${formData.subject} happen before ${new Date(formData.deadline).toLocaleDateString()}?`;
  } else if (formData.event_type === 'winner') {
    if (!formData.option1 || !formData.option2) {
      throw new Error('Both options are required for winner type events');
    }
    formData.question = `Who will win? ${formData.option1} or ${formData.option2}`;
    // Also update the options text
    formData.options[0].text = formData.option1;
    formData.options[1].text = formData.option2;
  }
};

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;
    validateForm();

    // Prepare data for submission
    const submitData = {
      title: formData.title,
      description: formData.description,
      event_type: formData.event_type,
      question: formData.question,
      start_time: formData.start_time,
      end_time: formData.end_time,
      betting_deadline: formData.betting_deadline,
      result_time: formData.result_time,
      options: formData.options,
      tags: [...formData.tags, ...formData.customTags],
      reference_event: formData.reference_event,
      reference_link: formData.reference_link
    };

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submitData)
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Error creating event');
    }

    emit('submit', data.event);
  } catch (error) {
    alert(error.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.create-event {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.event-form {
  background: #F1FAEE;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(29, 53, 87, 0.1);
}

.form-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #A8DADC;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h3 {
  color: #1D3557;
  margin: 0 0 16px 0;
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  color: #457B9D;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #A8DADC;
  border-radius: 6px;
  font-size: 1rem;
  color: #1D3557;
  background: white;
  transition: border-color 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #457B9D;
}

.option-item {
  background: rgba(168, 218, 220, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.remove-btn {
  background: #E63946;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  margin-bottom: 8px;
}

.add-btn {
  background: #457B9D;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.tags-input {
  border: 2px solid #A8DADC;
  border-radius: 6px;
  padding: 8px;
  background: white;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag {
  background: #A8DADC;
  color: #1D3557;
  padding: 4px 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #1D3557;
  cursor: pointer;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
}

.tags-input input {
  border: none;
  padding: 4px;
  width: 100%;
}

.tags-input input:focus {
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.cancel-btn, .submit-btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: none;
  border: 2px solid #457B9D;
  color: #457B9D;
}

.submit-btn {
  background: #457B9D;
  border: none;
  color: white;
}

.cancel-btn:hover {
  background: rgba(69, 123, 157, 0.1);
}

.submit-btn:hover {
  background: #1D3557;
}

.submit-btn:disabled {
  background: #A8DADC;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 8px;
  }
  
  .create-event {
    padding: 12px;
  }
  
  .event-form {
    padding: 16px;
  }
}

.info-alert {
  background: #E3F2FD;
  border: 1px solid #90CAF9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.info-alert h4 {
  color: #1976D2;
  margin: 0 0 8px 0;
}

.info-alert ul {
  margin: 0;
  padding-left: 20px;
}

.info-alert li {
  color: #2196F3;
  margin-bottom: 4px;
}

.question-template {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.inline-input {
  width: auto;
  min-width: 150px;
}

.options-info {
  background: rgba(255, 193, 7, 0.1);
  border-left: 4px solid #FFC107;
  padding: 8px 16px;
  margin-bottom: 16px;
}

.options-info p {
  color: #F57C00;
  margin: 0;
  font-size: 0.9rem;
}

.help-text {
  display: block;
  color: #666;
  font-size: 0.8rem;
  margin-top: 4px;
}

.tag-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tag-category h5 {
  color: #1D3557;
  margin: 0 0 8px 0;
  font-size: 1rem;
}

.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #F1FAEE;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.tag-checkbox input {
  width: auto;
}

.custom-tags h4 {
  color: #1D3557;
  margin: 0 0 8px 0;
  font-size: 1rem;
}
</style> 