---
layout: page
permalink: /leetcode-guide/
title: LeetCode Guide
icon: fas fa-brain
order: 4
---

<div id="leetcode-app-container">
  <!-- LeetCode Study Guide will be loaded here -->
</div>

<!-- Include LeetCode Study Guide styles -->
<link rel="stylesheet" href="{{ '/leetcode-guide/styles.css' | relative_url }}">
<link rel="stylesheet" href="{{ '/leetcode-guide/pattern-styles.css' | relative_url }}">

<!-- Include LeetCode Study Guide scripts -->
<script src="{{ '/leetcode-guide/config.js' | relative_url }}"></script>
<script src="{{ '/leetcode-guide/auth.js' | relative_url }}"></script>
<script src="{{ '/leetcode-guide/pattern-app.js' | relative_url }}"></script>

<script>
// Initialize the LeetCode Study Guide when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Load the main HTML content
  fetch('{{ "/leetcode-guide/index.html" | relative_url }}')
    .then(response => response.text())
    .then(html => {
      // Extract the body content from the loaded HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body.innerHTML;
      
      // Insert into our container
      document.getElementById('leetcode-app-container').innerHTML = bodyContent;
      
      // Initialize the app
      if (typeof PatternFocusedApp !== 'undefined') {
        window.app = new PatternFocusedApp();
      }
    })
    .catch(error => {
      console.error('Error loading LeetCode Study Guide:', error);
      document.getElementById('leetcode-app-container').innerHTML = 
        '<p>Error loading LeetCode Study Guide. <a href="/leetcode-guide/index.html">Click here to access directly.</a></p>';
    });
});
</script>

<style>
/* Integrate LeetCode Guide styling with Jekyll theme */
#leetcode-app-container {
  margin-top: 2rem;
}

/* Ensure proper spacing and styling */
.container {
  max-width: none;
}

/* Hide Jekyll header for full app experience */
.post-header {
  display: none;
}
</style>
