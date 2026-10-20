'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [fbToken, setFbToken] = useState('');
  const [fbPageId, setFbPageId] = useState('');
  const [igToken, setIgToken] = useState('');
  const [redditToken, setRedditToken] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user) loadSettings();
  }, [user, loading]);

  const loadSettings = async () => {
    if (!user) return;
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      setFbToken(data.fbToken || '');
      setFbPageId(data.fbPageId || '');
      setIgToken(data.igToken || '');
      setRedditToken(data.redditToken || '');
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), {
      fbToken, fbPageId, igToken, redditToken,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading || !user) return <div className="p-8">লোড হচ্ছে...</div>;

  return (
    <div className="ml-64 p-8">
      <h1 className="text-3xl font-bold mb-6">সেটিংস</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-3 text-blue-600">Facebook</h2>
          <input placeholder="Page Access Token" value={fbToken} onChange={e => setFbToken(e.target.value)} className="w-full mb-2 px-4 py-2 border rounded-lg" />
          <input placeholder="Page ID" value={fbPageId} onChange={e => setFbPageId(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 text-pink-600">Instagram</h2>
          <input placeholder="Instagram Access Token" value={igToken} onChange={e => setIgToken(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 text-orange-600">Reddit</h2>
          <input placeholder="Reddit Access Token (Bearer)" value={redditToken} onChange={e => setRedditToken(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          <p className="text-xs text-gray-500 mt-1">reddit.com/prefs/apps থেকে App তৈরি করে OAuth Token নাও</p>
        </div>
        <button onClick={saveSettings} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
          সেভ করো
        </button>
        {saved && <p className="text-green-600">সেভ হয়েছে!</p>}
      </div>
    </div>
  );
}
