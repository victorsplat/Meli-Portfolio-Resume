import getClient from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
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

const DEFAULT_SETTINGS: Record<string, unknown> = {
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

function sanitizeCategory(cat: unknown): Record<string, unknown> | null {
  if (!cat || typeof cat !== 'object') return null;
  const c = cat as Record<string, unknown>;
  const id = sanitize(String(c.id || '').trim());
  if (!id) return null;
  return {
    id,
    name: {
      en: sanitize(String((c.name as Record<string, string>)?.en || c.name || '')),
      es: sanitize(String((c.name as Record<string, string>)?.es || '')),
      pt: sanitize(String((c.name as Record<string, string>)?.pt || '')),
    },
    emoji: sanitize(String(c.emoji || '📁')),
    sortOrder: typeof c.sortOrder === 'number' ? Math.max(0, c.sortOrder) : 0,
  };
}

function sanitizeSettings(body: Record<string, unknown>): Record<string, unknown> {
  const settings: Record<string, unknown> = { hero: {}, categories: { items: [] }, aboutMe: {}, footer: {} };

  for (const section of ['hero', 'aboutMe', 'footer']) {
    const src = (body[section] as Record<string, unknown>) || {};
    const sectionSettings: Record<string, unknown> = {};
    const defaults = DEFAULT_SETTINGS[section] as Record<string, unknown>;
    for (const field of Object.keys(defaults)) {
      if (TEXT_FIELDS.includes(field)) {
        const val = (src[field] as Record<string, string>) || {};
        sectionSettings[field] = {
          en: sanitize(val.en || ''),
          es: sanitize(val.es || ''),
          pt: sanitize(val.pt || ''),
        };
      } else if (ARRAY_FIELDS.includes(field)) {
        const arr = Array.isArray(src[field]) ? (src[field] as unknown[]).filter(id => typeof id === 'string') : [];
        sectionSettings[field] = arr;
      }
    }
    settings[section] = sectionSettings;
  }

  if (Array.isArray(body.categories)) {
    const categoryItems = (body.categories as unknown as Record<string, unknown>).items;
    if (Array.isArray(categoryItems)) {
      (settings.categories as Record<string, unknown>).items = categoryItems
        .map(sanitizeCategory)
        .filter(Boolean);
    }
  } else if (body.categories && typeof body.categories === 'object') {
    const categoryItems = (body.categories as Record<string, unknown>).items;
    if (Array.isArray(categoryItems)) {
      (settings.categories as Record<string, unknown>).items = categoryItems
        .map(sanitizeCategory)
        .filter(Boolean);
    }
  }

  return settings;
}

export async function GET() {
  try {
    const client = await getClient();
    const db = client.db('gallery');
    const collection = db.collection('settings');
    const doc = await collection.findOne({ _id: 'main' as any });
    return NextResponse.json((doc as Record<string, unknown>)?.data || DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function PUT(request: NextRequest) {
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
      { _id: 'main' as any },
      { $set: { data, updatedAt: new Date() } as Record<string, unknown> },
      { upsert: true }
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
