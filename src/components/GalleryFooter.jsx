'use client';

import { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { FaGithub, FaInstagram } from 'react-icons/fa';
import Link from 'next/link';

const WHATSAPP_NUMBER = '5511963452860';
const CONTACT_EMAIL = 'victor@example.com';

const socialLinks = [
  { icon: FaGithub, label: 'GitHub', href: 'https://github.com/victorsplat' },
  { icon: FaInstagram, label: 'Instagram', href: '#' },
  { icon: Mail, label: 'Email', href: `mailto:${CONTACT_EMAIL}` },
];

export default function GalleryFooter({ t }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill all fields');
      return;
    }
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/gallery/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="bg-secondary dark:bg-secondary/20 w-full rounded-t-xl mt-16">
      <div className="mx-auto max-w-screen-xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Brand + Social */}
          <div className="flex flex-col items-center lg:items-start">
            <span className="text-2xl font-bold text-accent dark:text-[#FFE600]">Meli Portfolio</span>
            <p className="text-muted mt-4 max-w-md text-center lg:text-left leading-relaxed">
              {t('gallery.footerDesc')}
            </p>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-6 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white border-none"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              {t('gallery.whatsapp')}
            </a>

            {/* Social */}
            <ul className="mt-8 flex justify-center lg:justify-start gap-6">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-muted hover:text-accent dark:hover:text-[#FFE600] transition"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon className="w-6 h-6" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Form */}
          <div className="w-full max-w-lg mx-auto lg:mx-0">
            <h3 className="text-lg font-semibold text-center lg:text-left mb-6">{t('gallery.contactTitle')}</h3>
            {sent ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-green-500 font-medium">{t('gallery.contactSent')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={t('gallery.contactName')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-panel-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <input
                  type="email"
                  placeholder={t('gallery.contactEmail')}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-panel-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
                <textarea
                  placeholder={t('gallery.contactMessage')}
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/50 dark:bg-white/5 border border-panel-border text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={sending}
                  className="btn w-full flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {t('gallery.contactSend')}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 border-t border-panel-border pt-6 text-center">
          <p className="text-sm text-muted">&copy; {new Date().getFullYear()} Meli Portfolio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
