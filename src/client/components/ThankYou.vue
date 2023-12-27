<template>
  <div class="container">
    <!-- Empty Left Panel -->
    <div class="left-panel"></div>

    <!-- Right Panel with Conditional Content -->
    <div class="right-panel">
      <div v-if="!isSubmitted" class="thank-you-content">
        <h1>Thank You!</h1>
        <p>We hope you enjoyed the game. Please share your suggestions with us.</p>
        <textarea v-model="suggestions" placeholder="Your suggestions..."></textarea>
        <button @click="submit">Submit</button>
      </div>

      <div v-else class="thank-you-message">
        <h2>Thank you for participating in our experiment!</h2>
        <p>Your feedback has been invaluable.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      suggestions: '',
      isSubmitted: false, // New property to track submission status
    };
  },
  methods: {
    submit() {
      this.$emit('submit-suggestion', this.suggestions);
      // Optionally reset the textarea or give feedback to the user
      this.isSubmitted = true; // Set to true after submission
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh; /* Full height of the viewport */
}

.left-panel {
  width: 360px; /* Width similar to Chat.vue's left panel */
  background-color: #3f0e40; /* Background color similar to Chat.vue */
  height: 100%; /* Full height */
}

.right-panel {
  flex-grow: 1;
  display: flex;
  align-items: center; /* Align vertically center */
  justify-content: center; /* Align horizontally center */
  height: 100%; /* Full height */
}

.thank-you-content {
  text-align: center;
  margin-bottom: 50px;
  width: 40%; /* Set a specific width for the container */
  margin: auto; /* Center the container */
  /* Additional styling for the content */
}

/* Style for the textarea, button, etc., similar to Chat.vue */
textarea {
  width: 100%; /* Adjust the width as needed */
  height: 200px; /* Make the textarea 5 times bigger */
  border-radius: 10px; /* Rounded corners */
  padding: 10px; /* Padding inside the textarea */
  margin-bottom: 20px; /* Space between textarea and button */
  border: 1px solid #ccc; /* Border color */
  resize: none; /* Disable resizing */
}

button {
  width: 105%; /* Match the width of the textarea */
  padding: 10px 15px; /* Padding similar to the Send button */
  background-color: #3f0e40; /* Background color similar to Send button */
  color: white; /* Text color */
  border: none; /* No border */
  border-radius: 5px; /* Rounded corners */
  cursor: pointer; /* Pointer cursor on hover */
  display: block; /* Block display to take full width */
}
.thank-you-message {
  text-align: center;
  margin: auto;
  width: 40%; /* Adjust width as per design */
  /* Additional styling for the thank you message */
}
</style>
