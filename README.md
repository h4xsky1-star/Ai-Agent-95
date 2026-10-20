# মার্কেটিং AI প্ল্যাটফর্ম (Firebase Auth সহ)

রিয়েল মাল্টি-ইউজার প্ল্যাটফর্ম।

## ফিচার
- Firebase Authentication (Email + Google)
- ইউজার-স্পেসিফিক সেটিংস (Firestore)
- AI পোস্ট জেনারেশন (Groq)
- Facebook / Instagram / Reddit ক্রেডেনশিয়াল সেভ
- সুন্দর ড্যাশবোর্ড UI

## সেটআপ
1. `npm install`
2. `.env.local` তৈরি করো:
```
GROQ_API_KEY=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
```
3. Firebase Console থেকে Authentication ও Firestore চালু করো
4. `npm run dev`

## নোট
- Groq key পাবলিক হয়ে গেছে, নতুন key বানিয়ে নাও।
- Firestore Security Rules সেট করো যাতে শুধু নিজের ডাটা দেখা যায়।
