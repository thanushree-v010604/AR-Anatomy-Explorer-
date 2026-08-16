
# 🌐 Human Anatomy AR Explorer

*A Final-Year AR Project for Interactive 3D Human Anatomy Learning*

A modern Augmented Reality (AR)–based anatomy learning application that allows users to explore human organs in 3D. Users can tap any organ to view its name, function, animations, and audio descriptions — making learning intuitive and engaging.

---

## 🚀 Features

* 🧍 **Full 3D human body model**
* 🫁 **Tap on any organ** to view:
* 🤖 Anatomy AI Assistant

  * Organ name
  * Function description
  * Animation / simulation
  * Audio narration
* 📱 **AR Mode** (no headset required) — view the anatomy model directly in your environment
* 🎧 **Audio-assisted learning**
* 🖥️ **Clean, responsive UI** built with React + Tailwind
* 🌐 **Live Demo**: [https://arproject-one.vercel.app/](https://arproject-one.vercel.app/)

---
---

## 🤖 Anatomy AI Assistant

The project has been extended with an AI-powered Anatomy Assistant to provide interactive, context-aware learning support for individual organs and anatomical systems.

### 🧠 AI Learning Modes

- 💬 **Ask** — Ask questions about the selected organ or anatomy system
- 🧑‍🏫 **Explain Simply** — Get beginner-friendly explanations of complex anatomy concepts
- 🔬 **Deep Dive** — Get detailed anatomy explanations covering structures, functions, and processes
- 📝 **Study Summary** — Generate concise study notes for revision
- 🧠 **Quiz Me** — Test your understanding with anatomy-focused questions
- 🔄 **Compare** — Compare the selected anatomy system with another available system

### 📚 Additional Learning Features

- Context-aware AI conversations based on the selected anatomy
- Suggested questions for guided learning
- AI-generated study material
- Interactive quiz functionality
- Anatomy system comparison
- Learning progress tracking
- Structured Markdown rendering for AI responses
- Proper formatting of headings, paragraphs, lists, and emphasized text

### 🏗️ AI Architecture

The Anatomy AI functionality uses a frontend-to-backend architecture to keep the AI API credentials server-side.

```text
Anatomy AI Interface
        ↓
Frontend AI Client
        ↓
Backend API
        ↓
LLM Provider
        ↓
AI Response
        ↓
Markdown Rendering

AI Components Added
src/
├── components/
│   └── AnatomyAI.tsx
│
└── services/
    └── aiClient.ts

server/
└── src/
    ├── routes/
    │   └── anatomyChat.ts
    │
    ├── services/
    │   └── llmProvider.ts
    │
    └── index.ts
## 🖼️ Screenshots for laptop and mobile view


<span>
<img src="images/pic1.jpeg" alt="AR Screenshot" width="500" height="700"/>
<img src="images/pic2.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic3.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic4.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic5.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic6.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic7.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
<img src="images/pic8.jpeg" alt="AR Screenshot" width="500" heihgt="700"/>
</span>

(Just replace the image paths with your own.)

---

## 🛠️ Tech Stack

| Layer               | Technology                                               |
| ------------------- | -------------------------------------------------------- |
| **Frontend**        | React, TypeScript, Vite, Tailwind CSS                    |
| **3D / AR**         | Three.js, WebXR, AR.js (or the one used in your project) |
| **Assets**          | 3D models, textures, audio narrations                    |
| **Deployment**      | Vercel                                                   |
| **Version Control** | Git + GitHub                                             |

---

## 📦 Installation & Run Locally

1. **Clone the repository**

   ```bash
   git clone https://github.com/raj-pandith/finalyearARAnatomyproject2.git
   cd finalyearARAnatomyproject2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   Go to:
   👉 [http://localhost:3000](http://localhost:3000)
   Grant **camera permissions** to test AR mode.

---

## 🎯 Project Goals

* Make anatomy learning interactive and immersive
* Help students visualize organs more clearly than flat diagrams
* Enable hands-on AR exploration without any headset
* Provide audio learning for better accessibility

---

## 📂 Project Structure

```
src/
  assets/        → 3D models, textures, audio files  
  components/    → UI Components  
  scenes/        → AR/Three.js scenes  
  styles/        → Tailwind/CSS  
public/
  index.html
package.json
vite.config.ts
```

---

## 🚧 Future Enhancements

* 🔬 Organ-system filters (Nervous, Digestive, Respiratory, etc.)
* 🌍 Multi-language audio descriptions
* 🎮 VR Mode using WebXR
* 🧠 Quiz mode for learning assessment
* 📱 Mobile performance optimizations (lazy-loading, model compression)

---

## 📜 License

This project is licensed under the **MIT License**.
See the [LICENSE](./LICENSE) file for details.

---

## 👤 Author

**Raj Pandith**
GitHub: [raj-pandith](https://github.com/raj-pandith)

