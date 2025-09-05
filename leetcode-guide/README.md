# LeetCode Study Guide - Interactive Web Interface

A modern, interactive web application for studying LeetCode problems organized by algorithmic patterns. Features progress tracking, filtering, search, and offline support.

## 🚀 Features

- **Interactive Problem Browser**: Browse problems with beautiful card-based UI
- **Progress Tracking**: Mark problems as completed, in-progress, or not-started
- **Local Persistence**: Your progress is saved in browser localStorage
- **Advanced Filtering**: Filter by category, pattern, difficulty, and status
- **Search Functionality**: Search problems by title, number, or pattern
- **Responsive Design**: Works perfectly on desktop and mobile
- **Offline Support**: Service worker enables offline functionality
- **GitHub Pages Ready**: Fully static, no server required

## 📁 File Structure

```
web/
├── index.html          # Main application HTML
├── styles.css          # Modern CSS styling with dark mode support
├── app.js             # JavaScript application logic
├── sw.js              # Service worker for offline support
├── problems.json      # Generated problem data (created by main.py)
└── README.md          # This file
```

## 🛠️ Setup & Usage

### 1. Generate Problem Data
First, run your Python script to generate the web interface:

```bash
cd /Users/naveen/PycharmProjects/leetcode_study_material
python main.py
# Choose option 2: "Generate Interactive Web Interface"
```

This will:
- Process your CSV file and markdown content
- Generate `problems.json` with all problem data
- Create the complete web interface in the `web/` directory

### 2. Local Development
To test locally, serve the files using a simple HTTP server:

```bash
cd web
python -m http.server 8000
# Or use Python 3
python3 -m http.server 8000
```

Then open: `http://localhost:8000`

### 3. GitHub Pages Deployment

#### Option A: Deploy from Repository Root
1. Push your entire repository to GitHub
2. Go to Settings → Pages
3. Set source to "Deploy from a branch"
4. Select branch: `main` or `master`
5. Set folder to `/web`
6. Your site will be available at: `https://yourusername.github.io/repositoryname`

#### Option B: Deploy from gh-pages Branch
1. Create a new branch called `gh-pages`
2. Copy all files from `web/` directory to the root of `gh-pages` branch
3. Push the `gh-pages` branch to GitHub
4. GitHub Pages will automatically serve from this branch

#### Option C: Use GitHub Actions (Recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.x'
    
    - name: Install dependencies
      run: |
        pip install google-generativeai tqdm
    
    - name: Generate web interface
      run: |
        python main.py --generate-web
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./web
```

## 💾 Data Persistence

The application uses browser localStorage to save:
- Problem completion status
- Progress timestamps
- User preferences

Data persists across browser sessions and survives page refreshes.

### Export/Import Progress
- **Export**: Click "Export Data" to download your progress as JSON
- **Import**: Use browser developer tools to restore from exported JSON:
  ```javascript
  localStorage.setItem('leetcode-study-progress', JSON.stringify(importedData));
  ```

## 🎨 Customization

### Themes
The interface supports both light and dark themes based on system preferences. To force a theme, add this CSS:

```css
/* Force dark theme */
@media (prefers-color-scheme: light) {
  /* Add dark theme styles here */
}
```

### Adding Custom Filters
Edit `app.js` and modify the `populateFilters()` function to add new filter options.

### Styling
Modify `styles.css` to customize:
- Colors and themes
- Layout and spacing
- Typography
- Animations and transitions

## 🔧 Technical Details

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design

### Performance
- Lazy loading for large problem sets
- Efficient filtering and search
- Minimal dependencies (only Font Awesome and Google Fonts)

### Security
- No server-side code required
- All data stored locally
- No external API calls (except CDN resources)

## 📱 Mobile Support

The interface is fully responsive and includes:
- Touch-friendly navigation
- Collapsible sidebar on mobile
- Optimized typography for small screens
- Swipe gestures support

## 🐛 Troubleshooting

### Problems Not Loading
1. Check that `problems.json` exists in the web directory
2. Verify the JSON file is valid (use a JSON validator)
3. Check browser console for errors

### Progress Not Saving
1. Ensure localStorage is enabled in your browser
2. Check if you're in private/incognito mode
3. Verify sufficient storage space

### GitHub Pages Not Working
1. Ensure all files are in the correct directory
2. Check that the repository is public (for free GitHub Pages)
3. Verify the Pages source settings in repository settings

## 📈 Analytics (Optional)

To add Google Analytics, insert this code in `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🤝 Contributing

To contribute or customize:
1. Fork the repository
2. Make your changes
3. Test locally
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

---

**Happy Studying! 🎯**

For questions or issues, please create an issue in the GitHub repository.
