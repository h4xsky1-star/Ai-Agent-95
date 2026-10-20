import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { analysis } = await req.json();

    const completion = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        {
          role: 'system',
          content: `তুমি একজন প্রফেশনাল সোশ্যাল মিডিয়া মার্কেটিং এক্সপার্ট। 
নিচের বিশ্লেষণের উপর ভিত্তি করে ৩টি আলাদা সোশ্যাল মিডিয়া পোস্ট তৈরি করো।

প্রতিটি পোস্টে থাকবে:
- content: আকর্ষণীয় ক্যাপশন (বাংলায়, স্বাভাবিকভাবে কিছু ইংরেজি শব্দ থাকতে পারে)
- hashtags: প্রাসঙ্গিক হ্যাশট্যাগ

শুধুমাত্র এই ফরম্যাটে JSON রিটার্ন করো:
{
  "posts": [
    {"content": "...", "hashtags": "#tag1 #tag2 #tag3"},
    {"content": "...", "hashtags": "#tag1 #tag2"},
    {"content": "...", "hashtags": "#tag1 #tag2 #tag3"}
  ]
}

অন্য কোনো টেক্সট দেবে না।`,
        },
        { role: 'user', content: typeof analysis === 'string' ? analysis : JSON.stringify(analysis) },
      ],
      temperature: 0.7,
    });

    let posts = [];
    try {
      const text = completion.choices[0].message.content || '{}';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      posts = parsed.posts || [];
    } catch (e) {
      posts = [
        { content: 'AI পোস্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।', hashtags: '#marketing' }
      ];
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
