import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const link = formData.get('link') as string | null;

    let summary = '';

    if (link) {
      const response = await fetch(link);
      const html = await response.text();
      const $ = cheerio.load(html);
      const title = $('title').text() || '';
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      const bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 1500);
      summary = `Title: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}`;
    }

    if (!summary) {
      return NextResponse.json({ error: 'লিংক দাও' }, { status: 400 });
    }

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
          { role: 'system', content: 'তুমি একজন মার্কেটিং এক্সপার্ট। প্রোডাক্ট বা সাবজেক্ট সংক্ষেপে বাংলায় সামারাইজ করো সোশ্যাল মিডিয়া পোস্টের জন্য।' },
          { role: 'user', content: summary },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiSummary = data.choices?.[0]?.message?.content || summary;

    return NextResponse.json({
      summary: aiSummary,
      raw: summary,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
