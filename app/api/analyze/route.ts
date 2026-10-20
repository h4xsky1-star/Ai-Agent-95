import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function callGemini(prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 500,
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
        const bodyText = $('body').text().replace(/\s+/g, ' ').slice(0, 1500);
        summary = `Title: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}`;
      } catch {
        summary = `Link: ${link}`;
      }
    }

    if (!summary) {
      return NextResponse.json({ error: 'লিংক দাও' }, { status: 400 });
    }

    const prompt = `তুমি একজন মার্কেটিং এক্সপার্ট। নিচের প্রোডাক্ট/সাবজেক্ট সংক্ষেপে বাংলায় সামারাইজ করো সোশ্যাল মিডিয়া পোস্টের জন্য।

${summary}`;

    const aiSummary = await callGemini(prompt);

    return NextResponse.json({
      summary: aiSummary || summary,
      raw: summary,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
  }
}
