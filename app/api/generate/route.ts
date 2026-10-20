import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function callOpenRouter(messages: any[], maxTokens = 600) {
  const models = [
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'nvidia/nemotron-3.5-lightning:free',
  ];

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://ai-agent-7ifv.onrender.com',
          'X-Title': 'Marketing AI Agent',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: maxTokens,
        }),
      });

      const data = await response.json();

      if (response.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
      console.log(`Model ${model} failed:`, data.error?.message || data);
    } catch (e) {
      console.log(`Model ${model} error:`, e);
    }
  }
  throw new Error('All free models failed. Try again later.');
}

export async function POST(req: NextRequest) {
  try {
    const { analysis } = await req.json();

    const systemPrompt = `তুমি একজন প্রফেশনাল সোশ্যাল মিডিয়া মার্কেটিং এক্সপার্ট। 
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
অন্য কোনো টেক্সট দেবে না।`;

    const userContent = typeof analysis === 'string' ? analysis.slice(0, 1800) : JSON.stringify(analysis).slice(0, 1800);

    const content = await callOpenRouter([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ], 700);

    let posts = [];
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      posts = parsed.posts || [];
    } catch {
      posts = [
        { content: content.slice(0, 300) || 'পোস্ট তৈরি হয়েছে।', hashtags: '#marketing #ai' }
      ];
    }

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
