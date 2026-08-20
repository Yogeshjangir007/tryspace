# TRYSPACE — AI & AR Virtual Shopping Platform

> **See it. Try it. Buy it.**  
> An Augmented Reality try-before-you-buy e-commerce platform for luxury furniture and home décor.

---

## 🚀 Quick Start (For You & Your Friends)

### Option 1: 1-Click Launch (Windows)
Just double-click **`start.bat`** in the project root folder. It will automatically:
1. Start the FastAPI backend on `http://localhost:8000`.
2. Install frontend dependencies and start Vite on `http://localhost:5173`.
3. Open `http://localhost:5173` in your browser.

*(On Mac / Linux, run `bash start.sh` in the terminal).*

---

### Option 2: Manual Terminal Commands

#### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev -- --host
```
Open **`http://localhost:5173`** in your browser.

---

## 📱 How to Use Phone AR (Google Scene Viewer)

1. Open the platform on your laptop at `http://localhost:5173`.
2. Ensure your phone and laptop are connected to the **same Wi-Fi network**.
3. Click any furniture piece and **scan the displayed QR code** with your phone's camera / Google Lens.
4. On your phone screen, tap **`Launch Google AR Camera`** to place the real-scale 3D furniture right onto your floor!

---

## 🌐 Instant Sharing Over Internet (Without Installation)

If you want to share with a friend without them installing Python/Node, you can create an instant public HTTPS tunnel from your computer:

```bash
# In a new terminal
npx localtunnel --port 5173
```
Or with ngrok:
```bash
ngrok http 5173
```
Share the generated `https://xxxx.loca.lt` or `https://xxxx.ngrok-free.app` link with your friend. They can open it on their phone from anywhere in the world!

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Google `<model-viewer>`, Lucide Icons, QR Code SVG
- **3D & AR Engine**: Google Scene Viewer (ARCore), WebXR, Khronos PBR glTF 2.0
- **Backend**: FastAPI (Python 3.10+), Uvicorn, CORS Middleware
