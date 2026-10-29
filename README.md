# claude-video

Claude Skill สำหรับสร้างคลิป YouTube Shorts ภาษาไทยแนวเล่าเรื่องด้วยภาพ 2D flat vector — ซับไฮไลต์คำสำคัญ, การ์ด HUD ข้อมูล, ตัวละคร puppet, เสียงพากย์ไทย และ end card ตอนต่อไป

ใส่หัวข้อ → Claude เขียนบท → **คุณ approve บท** → Claude ทำ storyboard → **คุณ approve storyboard** → render เป็น mp4 (720×1280, 30fps)

> **สถานะ:** อยู่ระหว่างพัฒนา — skill ยังไม่พร้อมใช้งาน ขั้นตอนด้านล่างคือการเตรียมเครื่องให้พร้อม

## สิ่งที่ต้องมี

| เครื่องมือ | เวอร์ชัน | ติดตั้ง (macOS) |
|---|---|---|
| [Claude Code](https://claude.com/claude-code) | ล่าสุด | ดูหน้าเว็บ |
| Node.js | 20+ | `brew install node` |
| FFmpeg | 6+ | `brew install ffmpeg` |
| Google AI Studio API key | free tier ใช้ได้ | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |

## 1. ติดตั้ง Claude Code plugin

รันใน terminal (ไม่ใช่ใน prompt ของ Claude) แล้ว **restart Claude Code**:

```bash
claude plugin marketplace add remotion-dev/claude-code-plugin
claude plugin install remotion@remotion
```

Plugin นี้ให้ Claude รู้วิธีเขียนและ render วิดีโอด้วย [Remotion](https://www.remotion.dev) ตรวจว่าติดตั้งแล้วด้วยคำสั่ง `/plugin` ใน Claude Code

## 2. ตั้งค่า environment

```bash
cp .env.example .env
```

แก้ `.env`:

| ตัวแปร | จำเป็น | ความหมาย |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | API key จาก Google AI Studio ใช้สร้างเสียงพากย์ไทย |
| `GEMINI_TTS_MODEL` | — | บังคับใช้ TTS model ที่ระบุ ปล่อยว่างให้ระบบเลือก model ที่ key ของคุณใช้ได้ (free tier บาง model ใช้ไม่ได้) |

`.env` ถูก ignore จาก git แล้ว — ห้าม commit key

## 3. ตั้งชื่อช่องและโลโก้

แก้ `config/brand.json`:

```json
{
  "channelName": "Lumo",
  "logo": "assets/brand/logo.svg",
  "watermark": "Lumo",
  "endCardHandle": "@lumo"
}
```

| ฟิลด์ | ใช้ตรงไหนในคลิป |
|---|---|
| `channelName` | ชื่อช่องใน end card |
| `logo` | โลโก้มุมขวาบนทุกฉาก — ใช้ไฟล์ **สี่เหลี่ยมจัตุรัส** SVG หรือ PNG พื้นใส (แนะนำ ≥ 256×256) |
| `watermark` | ข้อความ watermark จาง ๆ กลางล่าง |
| `endCardHandle` | handle ที่โชว์ท้ายคลิป |

ค่าเริ่มต้น "Lumo" และ `assets/brand/logo.svg` เป็น **mock** — เปลี่ยนเป็นของคุณก่อนเผยแพร่ และอย่าใช้ชื่อหรือโลโก้ของช่องอื่น

## 4. ใส่เพลงประกอบ (BGM)

โปรเจกต์ไม่แจกเพลง — โหลดมาเองแล้ววางตาม mood:

```
assets/bgm/
├── mystery/   ลึกลับ ชวนสงสัย
├── horror/    สยองขวัญ
├── funny/     ตลก เบา ๆ
├── epic/      ยิ่งใหญ่ ตื่นเต้น
├── chill/     สบาย ๆ
└── tech/      เทคโนโลยี อธิบายความรู้
```

รองรับ `.mp3` `.wav` `.m4a` ไฟล์เสียงในโฟลเดอร์นี้ไม่ถูก commit

แหล่งเพลงที่ใช้ได้ฟรี (เช็ค license ทุกครั้งก่อนใช้):

| แหล่ง | หมายเหตุ |
|---|---|
| [YouTube Audio Library](https://studio.youtube.com) (YouTube Studio → Audio library) | ปลอดภัยที่สุดสำหรับช่องที่ monetize |
| [Pixabay Music](https://pixabay.com/music/) | ไม่ต้องให้เครดิต |
| [Incompetech](https://incompetech.com) | CC-BY — ต้องใส่เครดิตใน description |

**Sound effects** ไม่ต้องเตรียม — ระบบสร้างหรือดึงจากแหล่ง CC0 ให้อัตโนมัติ

## 5. ใช้งาน

เปิด Claude Code ในโฟลเดอร์นี้ แล้วสั่ง เช่น:

```
สร้างคลิป: ถ้าคุณเป็นแมวจรในกรุงเทพ 1 วัน
```

Claude จะหยุดให้ approve 2 ครั้ง (บท และ storyboard) ก่อน render ไฟล์ผลลัพธ์อยู่ใน `out/`

## โครงสร้างโปรเจกต์

```
assets/brand/     โลโก้ช่อง
assets/bgm/       เพลงประกอบ แยกตาม mood
config/           brand.json
docs/resource/    คลิปตัวอย่างต้นแบบสไตล์ (local เท่านั้น ไม่อยู่ใน git)
.env.example      template ตัวแปร environment
```
