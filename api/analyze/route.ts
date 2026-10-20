import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import * as cheerio from 'cheerio';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const link = formData.get('link') as string | null;
    const imageFile = formData.get('image') as File | null;

    let summary = '';

    if (link) {
      const response = await fetch(link);
      const html = await response.text();
      const $ = cheerio.load(html);
      const title = $('title').text();
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      const bodyText = $('body').text().slice(0, 2000);
      summary = `Title: ${title}\nDescription: ${metaDesc}\nContent: ${bodyText}`;
    }

    if (imageFile) {
      const buffer = await imageFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mime = imageFile.type;

      const completion = await groq.chat.completions.create({
        model: 'qwen/qwen3.8-27b',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this product image in detail for marketing purposes. Extract key features, colors, and target audience ideas.' },
              {
                type: 'image_url',
                image_url: { url: `data:${mime};base64,${base64}` },
              },
            ],
          },
        ],
      });
      summary += '\n\nImage Analysis: ' + completion.choices[0].message.content;
    }

    if (!summary) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    // Further AI summary
    const aiSummary = await groq.chat.completions.create({
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: 'You are a marketing expert. Summarize the product/subject for social media marketing in Bengali and English.' },
        { role: 'user', content: summary },
      ],
    });

    return NextResponse.json({
      summary: aiSummary.choices[0].message.content,
      raw: summary,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
