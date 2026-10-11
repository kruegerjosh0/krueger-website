import re

build_script = 'scripts/build-single-html.js'

with open(build_script, 'r') as f:
    content = f.read()

# Replace the injected environment variables with the actual values the user provided
old_config = """        const firebaseConfig = {
          apiKey: "${process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY'}",
          authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_FIREBASE_AUTH_DOMAIN'}",
          projectId: "${process.env.FIREBASE_PROJECT_ID || 'YOUR_FIREBASE_PROJECT_ID'}",
          storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_FIREBASE_STORAGE_BUCKET'}",
          messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_FIREBASE_MESSAGING_SENDER_ID'}",
          appId: "${process.env.FIREBASE_APP_ID || 'YOUR_FIREBASE_APP_ID'}"
        };"""

new_config = """        const firebaseConfig = {
          apiKey: "AIzaSyBBFi6XGAsdENyNGzHlIAjxlcqwGA9f0Cc",
          authDomain: "kpwebsite-83a6b.firebaseapp.com",
          projectId: "kpwebsite-83a6b",
          storageBucket: "kpwebsite-83a6b.firebasestorage.app",
          messagingSenderId: "489955386353",
          appId: "1:489955386353:web:57ff0a92fb9dc3bd189a50",
          measurementId: "G-PV7PNYLMB4"
        };"""

content = content.replace(old_config, new_config)

with open(build_script, 'w') as f:
    f.write(content)
