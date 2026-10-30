# 2d-reels

Claude Skill ทำคลิปสั้นภาษาไทยสไตล์ 2D (720×1280) จากหัวข้อเดียว: บท → เสียงพากย์ → ฉาก → mp4

## ติดตั้ง

ต้องมี [Claude Code](https://claude.com/claude-code), Node 20+, ffmpeg (`brew install node ffmpeg`)

```bash
cd engine && npm install && cd ..   # ครั้งเดียวหลัง clone (~430 MB)
cp .env.example .env                # ใส่ GEMINI_API_KEY (ฟรีที่ aistudio.google.com/apikey)
```

ติดตั้ง Remotion plugin ให้ Claude (รันใน terminal แล้ว restart Claude Code):

```bash
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

ไม่บังคับ:
- เพลงประกอบ: branch `with_bgm` มีเพลงใน `assets/bgm/<mood>/` มาให้แล้ว 17 เพลง (`mystery` `horror` `funny` `epic` `chill` `tech`) เพิ่มเพลงเองได้ในโฟลเดอร์เดียวกัน
- ชื่อช่อง/โลโก้: แก้ `config/brand.json` และ `assets/brand/logo.svg`

## ใช้งาน

เปิด Claude Code ในโฟลเดอร์นี้ แล้วพิมพ์

```
/2d-reels ถ้าแมวไม่ได้ร้อง แต่ Beatbox แทน
```

Claude จะเขียนบทแล้ว**รอคุณ approve** จากนั้นทำต่อเองจนได้ `clips/<slug>/renders/final.mp4`

ใช้ได้บน macOS และ Linux (Windows ใช้ผ่าน WSL) ตอน render ครั้งแรก Remotion จะดาวน์โหลด Chrome headless ให้อัตโนมัติ
