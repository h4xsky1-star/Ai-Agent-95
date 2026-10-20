import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { analysis } = await req.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://ai-agent-7ifv.onrender.com',
        'X-Title': 'Marketing AI Agent',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [
          {
            role: 'system',
            content: `তুমি একজন প্রফেশনাল সোশ্যাল মিডিয়া মার্কেটিং এক্সপার্ট। 
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
অন্য কোনো টেক্সট দেবে না।`,
          },
          { role: 'user', content: typeof analysis === 'string' ? analysis : JSON.stringify(analysis) },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'OpenRouter error' }, { status: 500 });
    }

    let posts = [];
    try {
      const text = data.choices?.[0]?.message?.content || '{}';
      const cleaned = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      posts = parsed.posts || [];
    } catch {
      posts = [
        { content: 'পোস্ট তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো।', hashtags: '#marketing' }
      ];
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
