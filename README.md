# Expenza – personal finance tracker (no login, no server, no database)

All your data is saved on the device itself (browser/WebView storage). Nothing is sent anywhere.

## Run on your computer
```bash
npm install
npm run dev          # open the printed http://localhost:... link
```

## Get the APK for free (no Android Studio needed)
1. Create an empty repo on GitHub and push this folder to it:
   ```bash
   git init && git add . && git commit -m "Expenza"
   git branch -M main
   git remote add origin https://github.com/<you>/expenza.git
   git push -u origin main
   ```
   (Use git, not the website upload – the site skips the hidden `.github` folder.)
2. GitHub → **Actions** tab → **Build Android APK** → **Run workflow** (it also runs on every push).
3. After ~5–10 minutes open the finished run → **Artifacts** → download **expenza-apk** → unzip → `app-debug.apk`.
4. Copy the APK to your phone, open it, and allow "Install unknown apps".

### Or build it on your own PC
Needs Node 22, JDK 21 and the Android SDK (Android Studio installs it).
```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android && ./gradlew assembleDebug      # Windows: gradlew.bat assembleDebug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

## Notes
- Data lives only on that device. Uninstalling the app or clearing its storage deletes it – use **Profile → Export your data** for a backup.
- Phone and computer versions keep separate data.
"# expenza_project" 
