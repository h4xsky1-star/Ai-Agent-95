'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles, Copy, Check, Facebook, Instagram, MessageSquare } from 'lucide-react';

export default function GeneratePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [link, setLink] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<any>({});
  const [subreddit, setSubreddit] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadCredentials();
  }, [user, loading, router]);

  const loadCredentials = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) setCredentials(snap.data());
  };

  const generate = async () => {
    if (!link && !image) {
      setError('লিংক বা ছবি দাও');
      return;
    }
    setGenerating(true);
    setError('');
    setPosts([]);

    try {
      const formData = new FormData();
      if (link) formData.append('link', link);
      if (image) formData.append('image', image);

      const analyzeRes = await fetch('/api/analyze', { method: 'POST', body: formData });
      const analysis = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analysis.error || 'বিশ্লেষণ ব্যর্থ');

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis }),
      });
      const data = await genRes.json();
      if (!genRes.ok) throw new Error(data.error || 'জেনারেশন ব্যর্থ');

      setPosts(data.posts || []);
    } catch (err: any) {
      setError(err.message || 'কিছু সমস্যা হয়েছে');
    } finally {
      setGenerating(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const publishPost = async (post: any, platform: 'facebook' | 'instagram' | 'reddit', index: number) => {
    const key = `${platform}-${index}`;
    setPublishing(key);
    setError('');

    try {
      let accessToken = '';
      let pageId = '';
      let extra: any = {};

      if (platform === 'facebook') {
        accessToken = credentials.fbToken;
        pageId = credentials.fbPageId;
        if (!accessToken || !pageId) throw new Error('Facebook Token বা Page ID সেটিংসে দাও');
      } else if (platform === 'instagram') {
        accessToken = credentials.igToken;
        if (!accessToken) throw new Error('Instagram Token সেটিংসে দাও');
      } else if (platform === 'reddit') {
        accessToken = credentials.redditToken;
        if (!accessToken) throw new Error('Reddit Access Token সেটিংসে দাও');
        if (!subreddit) throw new Error('Subreddit নাম দাও');
        extra.subreddit = subreddit.replace(/^r\//, '');
        extra.title = post.content.slice(0, 100);
      }

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          content: `${post.content}\n\n${post.hashtags}`,
          pageId,
          accessToken,
          ...extra,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'পোস্ট ব্যর্থ');

      alert(`${platform === 'facebook' ? 'Facebook' : platform === 'instagram' ? 'Instagram' : 'Reddit'}-এ পোস্ট সফল!`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(null);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="ml-64 p-8 min-h-screen bg-gray-50">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          নতুন পোস্ট তৈরি
        </h1>
        <p className="text-gray-600 mb-8">AI পোস্ট তৈরি করো এবং Facebook / Instagram / Reddit-এ পাবলিশ করো।</p>

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <div className="space-y-4">
            <input
              type="url"
              placeholder="ওয়েবসাইট / প্রোডাক্ট লিংক"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border rounded-xl"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={generate}
              disabled={generating}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? 'তৈরি হচ্ছে...' : 'AI দিয়ে পোস্ট তৈরি করো'}
            </button>
          </div>
        </div>

        {posts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <input
                placeholder="Subreddit (যেমন: marketing বা r/marketing)"
                value={subreddit}
                onChange={(e) => setSubreddit(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg text-sm"
              />
            </div>

            {posts.map((post, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm border p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">পোস্ট {index + 1}</span>
                  <button onClick={() => copyText(`${post.content}\n\n${post.hashtags}`, String(index))} className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm">
                    {copied === String(index) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    কপি
                  </button>
                </div>
                <p className="text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>
                <p className="text-blue-600 text-sm mb-4">{post.hashtags}</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => publishPost(post, 'facebook', index)}
                    disabled={publishing === `facebook-${index}`}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    <Facebook className="w-4 h-4" /> Facebook
                  </button>
                  <button
                    onClick={() => publishPost(post, 'instagram', index)}
                    disabled={publishing === `instagram-${index}`}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </button>
                  <button
                    onClick={() => publishPost(post, 'reddit', index)}
                    disabled={publishing === `reddit-${index}`}
                    className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4" /> Reddit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
