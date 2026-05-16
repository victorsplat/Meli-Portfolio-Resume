import getClient from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sanitize } from '@/lib/validate';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const TEXT_FIELDS = ['title', 'subtitle', 'text'];
const ARRAY_FIELDS = ['imageIds'];

const DEFAULT_CATEGORIES = [
  { id: 'design', name: { en: 'Design', es: 'Diseño', pt: 'Design' }, emoji: '🎨', sortOrder: 0 },
  { id: 'aboutMe', name: { en: 'About Me', es: 'Sobre Mí', pt: 'Sobre Mim' }, emoji: '👤', sortOrder: 1 },
  { id: 'skate', name: { en: 'Skate', es: 'Skate', pt: 'Skate' }, emoji: '🛹', sortOrder: 2 },
  { id: 'drinks', name: { en: 'Drinks', es: 'Bebidas', pt: 'Bebidas' }, emoji: '🍹', sortOrder: 3 },
  { id: 'food', name: { en: 'Food', es: 'Comida', pt: 'Comida' }, emoji: '🍕', sortOrder: 4 },
  { id: 'others', name: { en: 'Others', es: 'Otros', pt: 'Outros' }, emoji: '✨', sortOrder: 5 },
];

const DEFAULT_SETTINGS = {
  hero: {
    title: { en: '', es: '', pt: '' },
    subtitle: { en: '', es: '', pt: '' },
    imageIds: [],
  },
  categories: {
    items: DEFAULT_CATEGORIES,
  },
  aboutMe: {
    title: { en: '', es: '', pt: '' },
    text: { en: '', es: '', pt: '' },
    imageIds: [],
  },
  footer: {
    text: { en: '', es: '', pt: '' },
    imageIds: [],
  },
};

function sanitizeCategory(cat) {
  if (!cat || typeof cat !== 'object') return null;
  const id = sanitize(String(cat.id || '').trim());
  if (!id) return null;
  return {
    id,
    name: {
      en: sanitize(String(cat.name?.en || cat.name || '')),
      es: sanitize(String(cat.name?.es || '')),
      pt: sanitize(String(cat.name?.pt || '')),
    },
    emoji: sanitize(String(cat.emoji || '📁')),
    sortOrder: typeof cat.sortOrder === 'number' ? Math.max(0, cat.sortOrder) : 0,
  };
}

function sanitizeSettings(body) {
  const settings = { hero: {}, categories: { items: [] }, aboutMe: {}, footer: {} };

  for (const section of ['hero', 'aboutMe', 'footer']) {
    const src = body[section] || {};
    settings[section] = {};
    for (const field of Object.keys(DEFAULT_SETTINGS[section])) {
      if (TEXT_FIELDS.includes(field)) {
        const val = src[field] || {};
        settings[section][field] = {
          en: sanitize(val.en || ''),
          es: sanitize(val.es || ''),
          pt: sanitize(val.pt || ''),
        };
      } else if (ARRAY_FIELDS.includes(field)) {
        const arr = Array.isArray(src[field]) ? src[field].filter(id => typeof id === 'string') : [];
        settings[section][field] = arr;
      }
    }
  }

  if (Array.isArray(body.categories?.items)) {
    settings.categories.items = body.categories.items
      .map(sanitizeCategory)
      .filter(Boolean);
  }

  return settings;
}

export async function GET() {
  try {
    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('settings');
    const doc = await collection.findOne({ _id: 'main' });
    return NextResponse.json(doc?.data || DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) return auth.error;

  const rl = rateLimit(getClientIp(request));
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, {
      status: 429,
      headers: { 'Retry-After': String(rl.retryAfter) }
    });
  }

  try {
    const body = await request.json();
    const data = sanitizeSettings(body);

    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('settings');

    await collection.updateOne(
      { _id: 'main' },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
