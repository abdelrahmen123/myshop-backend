# 🛠️ Backend - متجر إلكتروني

هذا هو الريبو الخاص بالباك اند لمشروع متجر إلكتروني، مبني باستخدام [NestJS](https://nestjs.com/) ويحتوي على وحدات متكاملة لإدارة المستخدمين، المنتجات، السلة، الطلبات، التقييمات، والمزيد.  
يستخدم المصادقة باستخدام JWT وPassport، ويعتمد على Prisma ORM مع قاعدة بيانات PostgreSQL. كما يدعم رفع الصور على السيرفر.

---

## 🚀 المتطلبات

- Node.js >= 18
- PostgreSQL
- pnpm أو npm

---

## 📦 التثبيت

``` bash
npm install
yarn install
pnpm install
```
⚙️ الإعداد

أنشئ ملف .env في جذر المشروع:

- DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
- JWT_SECRET="your_jwt_secret"
- PORT=3000

شغل Prisma
``` bash
npx prisma generate
npx prisma migrate dev --name init
yarn prisma generate
yarn prisma migrate dev --name init
pnpm prisma generate
pnpm prisma migrate dev --name init
```

---

▶️ التشغيل
```
npm run start:dev
yarn run start:dev
pnpm run start:dev
```
---
🧱 بنية المشروع

``` 
src/
│
├── auth/         ← تسجيل الدخول والتسجيل (JWT + Passport)
├── users/        ← إدارة حسابات المستخدمين
├── products/     ← إدارة المنتجات
├── categories/   ← التصنيفات
├── cart/         ← السلة
├── orders/       ← الطلبات
├── reviews/      ← تقييمات المنتجات
└── main.ts       ← نقطة بدء التطبيق
```
---

🔐 المصادقة

- يعتمد على Passport و JWT
- توكن JWT يتم إرساله في ترويسة Authorization
- إمكانية حماية المسارات عبر @UseGuards(JwtAuthGuard)

---

🧠 التقنيات المستخدمة

- NestJs
- Prisma ORM
- postgreSQL
- Passport + Jwt
- Multer
- Swagger
- Jest

---

👨‍💻 المطور

تم تطوير هذا المشروع ضمن خطة تعلم وتطبيق لتقنيات الـ Backend باستخدام NestJS وPrisma.
لأي اقتراحات أو مساهمات مستقبلية، يُرجى فتح Issue أو إرسال Pull Request.
