import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

async function callOpenRouter(messages: any[], maxTokens = 400) {
  const models = [
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
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
          max_tokens: maxTokens,
        }),
      });

      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (e) {
      console.log(e);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const link = formData.get('link') as string | null;

    let summary = '';

    if (link) {
      try {
        const response = await fetch(link);
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('title').text() || '';
        const metaDesc = $('meta[name="description"]').attr('content') || '';
        const bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 1200);
        summary = `Title: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}`;
      } catch {
        summary = `Link: ${link}`;
      }
    }

    if (!summary) {
      return NextResponse.json({ error: 'লিংক দাও' }, { status: 400 });
    }

    const aiSummary = await callOpenRouter([
      { role: 'system', content: 'তুমি একজন মার্কেটিং এক্সপার্ট। প্রোডাক্ট বা সাবজেক্ট সংক্ষেপে বাংলায় সামারাইজ করো সোশ্যাল মিডিয়া পোস্টের জন্য।' },
      { role: 'user', content: summary },
    ]);

    return NextResponse.json({
      summary: aiSummary || summary,
      raw: summary,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
