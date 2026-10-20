import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { platform, content, pageId, accessToken, imageUrl, subreddit, title } = await req.json();

    if (!content || !accessToken) {
      return NextResponse.json({ error: 'Content and access token required' }, { status: 400 });
    }

    // ==================== FACEBOOK ====================
    if (platform === 'facebook') {
      if (!pageId) return NextResponse.json({ error: 'Facebook Page ID required' }, { status: 400 });

      const response = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          access_token: accessToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) return NextResponse.json({ error: data.error?.message || 'Facebook failed' }, { status: 400 });
      return NextResponse.json({ success: true, postId: data.id, platform: 'facebook' });
    }

    // ==================== INSTAGRAM ====================
    if (platform === 'instagram') {
      if (!imageUrl) return NextResponse.json({ error: 'Instagram requires a public image URL' }, { status: 400 });

      const containerRes = await fetch(`https://graph.facebook.com/v21.0/me/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: content,
          access_token: accessToken,
        }),
      });
      const containerData = await containerRes.json();
      if (!containerRes.ok) return NextResponse.json({ error: containerData.error?.message || 'IG container failed' }, { status: 400 });

      const publishRes = await fetch(`https://graph.facebook.com/v21.0/me/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      });
      const publishData = await publishRes.json();
      if (!publishRes.ok) return NextResponse.json({ error: publishData.error?.message || 'IG publish failed' }, { status: 400 });

      return NextResponse.json({ success: true, postId: publishData.id, platform: 'instagram' });
    }

    // ==================== REDDIT ====================
    if (platform === 'reddit') {
      if (!subreddit) return NextResponse.json({ error: 'Subreddit name required' }, { status: 400 });

      const postTitle = title || content.slice(0, 100);
      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MarketingAI/1.0',
        },
        body: new URLSearchParams({
          sr: subreddit,
          kind: 'self',
          title: postTitle,
          text: content,
          api_type: 'json',
        }),
      });

      const data = await response.json();
      if (!response.ok || data.json?.errors?.length) {
        return NextResponse.json({ error: data.json?.errors?.[0]?.[1] || 'Reddit post failed' }, { status: 400 });
      }

      return NextResponse.json({ success: true, platform: 'reddit', data });
    }

    return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Publishing failed' }, { status: 500 });
  }
}
