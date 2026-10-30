# 2d-reels

Claude Skill ทำคลิปสั้นภาษาไทยสไตล์ 2D (720×1280) จากหัวข้อเดียว: บท → เสียงพากย์ → ฉาก → mp4

## ติดตั้ง

ต้องมี [Claude Code](https://claude.com/claude-code), Node 20+, ffmpeg (`brew install node ffmpeg`)

```bash
cd engine && npm install && cd ..   # ครั้งเดียวหลัง clone (~430 MB)
cp .env.example .env                # ใส่ GEMINI_API_KEY (ฟรีที่ aistudio.google.com/apikey)
```

ไม่บังคับ:
- เพลงประกอบ: วางไฟล์ใน `assets/bgm/<mood>/` (`mystery` `horror` `funny` `epic` `chill` `tech`) ถ้าไม่มี คลิปจะไม่มีเพลง
- ชื่อช่อง/โลโก้: แก้ `config/brand.json` และ `assets/brand/logo.svg`

## ใช้งาน

เปิด Claude Code ในโฟลเดอร์นี้ แล้วพิมพ์

```
/2d-reels ถ้าแมวไม่ได้ร้อง แต่ Beatbox แทน
```

Claude จะเขียนบทแล้ว**รอคุณ approve** จากนั้นทำต่อเองจนได้ `clips/<slug>/renders/final.mp4`

ใช้ได้บน macOS และ Linux (Windows ใช้ผ่าน WSL) ตอน render ครั้งแรก Remotion จะดาวน์โหลด Chrome headless ให้อัตโนมัติ
