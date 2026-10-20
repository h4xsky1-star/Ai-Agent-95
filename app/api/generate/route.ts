import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini API error');
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function POST(req: NextRequest) {
  try {
    const { analysis } = await req.json();

    const prompt = `তুমি একজন প্রফেশনাল সোশ্যাল মিডিয়া মার্কেটিং এক্সপার্ট। 
নিচের বিশ্লেষণের উপর ভিত্তি করে ৩টি আলাদা সোশ্যাল মিডিয়া পোস্ট তৈরি করো।

প্রতিটি পোস্টে থাকবে:
- content: আকর্ষণীয় ক্যাপশন (বাংলায়, সংক্ষিপ্ত রাখো)
- hashtags: প্রাসঙ্গিক হ্যাশট্যাগ

শুধুমাত্র এই ফরম্যাটে JSON রিটার্ন করো:
{
  "posts": [
    {"content": "...", "hashtags": "#tag1 #tag2"},
    {"content": "...", "hashtags": "#tag1 #tag2"},
    {"content": "...", "hashtags": "#tag1 #tag2"}
  ]
}
অন্য কোনো টেক্সট দেবে না।

বিশ্লেষণ:
${typeof analysis === 'string' ? analysis.slice(0, 2500) : JSON.stringify(analysis).slice(0, 2500)}`;

    const text = await callGemini(prompt);

    let posts = [];
    try {
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      posts = parsed.posts || [];
    } catch {
      posts = [
        { content: text.slice(0, 400) || 'পোস্ট তৈরি হয়েছে।', hashtags: '#marketing #ai' }
      ];
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
