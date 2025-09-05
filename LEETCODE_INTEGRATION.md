# 🧠 LeetCode Study Guide Integration

This repository now includes an integrated **LeetCode Study Guide** - a comprehensive, cloud-enabled learning platform for algorithmic problem-solving.

## 🚀 **What's Included**

### **Frontend Integration (Jekyll Blog)**
- **New Navigation Tab**: "LeetCode Guide" in your main blog navigation
- **Seamless Integration**: Maintains your existing blog theme and styling  
- **Direct Access**: Available at `/leetcode-guide/` on your website

### **Backend Infrastructure**
- **Cloudflare Workers API** (`/cloudflare/`) - Serverless backend
- **D1 Database** - User authentication and progress tracking
- **Environment Configuration** - Secure secrets management

### **Study Materials**
- **Pre-generated Content** (`leetcode-guide/leet/`) - Pattern-focused problem organization
- **Problem Database** (`leetcode-guide/problems.json`) - Comprehensive problem dataset

## 🔧 **Setup Instructions**

### **1. Deploy Cloudflare Workers Backend**
```bash
cd cloudflare
wrangler deploy
```
- Get your Worker URL: `https://your-worker.your-subdomain.workers.dev`
- Set `JWT_SECRET` in Cloudflare dashboard environment variables

### **2. Configure GitHub Repository Secrets**
Go to your repository **Settings → Secrets and Variables → Actions** and add:
```
LEETCODE_API_URL = https://your-worker.your-subdomain.workers.dev
```

### **3. Content is Pre-generated**
The LeetCode Study Guide comes with pre-generated content and problem explanations. No additional content generation is needed - the study materials are ready to use!

### **4. Deploy to GitHub Pages**
```bash
git add .
git commit -m "feat: integrate LeetCode Study Guide with personal blog"
git push origin main
```

The GitHub Actions workflow will automatically:
- Configure environment variables for production
- Build Jekyll site with integrated LeetCode guide  
- Deploy to GitHub Pages

## 🎯 **Features**

### **🔐 User Authentication**
- Secure registration and login
- JWT-based authentication
- Session management
- Cloud sync for progress and notes

### **📚 Pattern-Focused Learning**
- Problems organized by algorithmic patterns
- Progress tracking per pattern and problem
- Filtering and sorting capabilities
- Completion rate visualization

### **☁️ Cloud Synchronization**
- User progress saved to cloud (D1 database)
- Personal notes for each problem
- Offline-first with cloud backup
- Cross-device synchronization

### **🎨 Modern UI/UX**
- Responsive design
- Dark mode support  
- Interactive problem navigation
- Real-time progress updates

## 🔒 **Security Features**

- **No secrets in code**: All API keys and secrets via environment variables
- **Secure authentication**: Password hashing, JWT tokens, session management
- **Database isolation**: D1 database only accessible via your Worker
- **CORS protection**: Secure cross-origin request handling

## 🏗️ **Architecture**

```
Jekyll Blog (GitHub Pages)    ←→    Cloudflare Workers + D1
├── Main blog content               ├── User authentication  
├── LeetCode Guide UI               ├── Progress tracking
├── Static file serving             ├── Notes management
└── Navigation integration          └── Secure API endpoints
```

## 📁 **File Structure**

```
naveenprasanth.github.io/
├── _tabs/leetcode.md              # Navigation tab
├── leetcode-guide/                # LeetCode Study Guide files
│   ├── index.html                # Main app interface
│   ├── auth.js                   # Authentication system
│   ├── pattern-app.js            # Core app logic
│   ├── config.js                 # Environment configuration
│   ├── leet/                     # Study materials
│   └── problems.json             # Problem database
├── cloudflare/                    # Backend API
│   ├── src/index.js              # Worker API endpoints
│   ├── migrations/               # Database schema
│   └── wrangler.toml            # Cloudflare configuration
└── .github/workflows/            # Deployment automation
```

## 🚀 **Usage**

1. **Visit your blog**: `https://naveenprasanth.github.io`
2. **Click "LeetCode Guide"** in the navigation  
3. **Register/Login** to sync progress across devices
4. **Start studying** with pattern-focused approach
5. **Track progress** and add personal notes

## 🛠️ **Development**

### **Local Development**
```bash
# Start Jekyll development server
bundle exec jekyll serve

# The LeetCode Guide will be available at:
# http://localhost:4000/leetcode-guide/
```

### **Backend Development**  
```bash
cd cloudflare
wrangler dev

# Test API endpoints locally at:
# http://localhost:8787
```

## 📈 **Benefits of This Integration**

✅ **Professional Portfolio**: Showcases full-stack development skills  
✅ **Unified Experience**: Seamless navigation between blog and study guide  
✅ **Easy Maintenance**: Single repository, unified deployment  
✅ **Scalable Architecture**: Cloud-native, serverless infrastructure  
✅ **Secure by Design**: No hardcoded secrets, proper authentication

---

**🎉 Your personal blog now features a production-ready, cloud-enabled LeetCode Study Guide!**

This integration demonstrates modern web development practices, cloud architecture knowledge, and full-stack development capabilities - perfect for showcasing your technical skills to potential employers and collaborators.
