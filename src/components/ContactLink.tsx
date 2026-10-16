import { ExternalLink, Linkedin, Mail, Phone, type LucideIcon } from 'lucide-react';
import type { IconType } from 'react-icons';
import {
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiTelegram,
  SiTiktok,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from 'react-icons/si';

type ContactIcon = {
  icon: IconType | LucideIcon;
  color: string;
  background: string;
};

const contactIcons: Record<string, ContactIcon> = {
  email: { icon: Mail, color: '#2875C7', background: '#E8F2FF' },
  github: { icon: SiGithub, color: '#24292F', background: '#ECEEF0' },
  facebook: { icon: SiFacebook, color: '#0866FF', background: '#EAF1FF' },
  instagram: { icon: SiInstagram, color: '#D94687', background: '#FCEAF2' },
  whatsapp: { icon: SiWhatsapp, color: '#128C7E', background: '#E6F6F0' },
  tiktok: { icon: SiTiktok, color: '#111111', background: '#EEEEEE' },
  youtube: { icon: SiYoutube, color: '#FF0000', background: '#FDEAEA' },
  linkedin: { icon: Linkedin, color: '#0A66C2', background: '#E7F1FA' },
  telegram: { icon: SiTelegram, color: '#229ED9', background: '#E8F6FC' },
  x: { icon: SiX, color: '#111111', background: '#EEEEEE' },
  phone: { icon: Phone, color: '#20865A', background: '#E8F7EF' },
  website: { icon: ExternalLink, color: '#5488CC', background: '#E8F2FF' },
};

type ContactTarget = {
  href: string;
  kind: string;
};

function getContactTarget(value: string): ContactTarget | null {
  const trimmed = value.trim().replace(/^[<([{"']+|[>\])}"',.]+$/g, '');
  if (!trimmed) return null;

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { href: `mailto:${trimmed}`, kind: 'email' };
  }
  if (/^mailto:/i.test(trimmed)) {
    return { href: trimmed, kind: 'email' };
  }
  if (/^tel:/i.test(trimmed)) {
    return { href: trimmed, kind: 'phone' };
  }
  if (/^[+()\d][+\d\s().-]{6,}$/.test(trimmed) && (trimmed.match(/\d/g)?.length ?? 0) >= 7) {
    return { href: `tel:${trimmed.replace(/[^\d+]/g, '')}`, kind: 'phone' };
  }

  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '');
    const kind = hostname === 'github.com' || hostname.endsWith('.github.com')
      ? 'github'
      : hostname === 'facebook.com' || hostname.endsWith('.facebook.com') || hostname === 'fb.com'
        ? 'facebook'
        : hostname === 'instagram.com' || hostname.endsWith('.instagram.com')
          ? 'instagram'
          : hostname === 'wa.me' || hostname === 'whatsapp.com' || hostname.endsWith('.whatsapp.com')
            ? 'whatsapp'
            : hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')
              ? 'tiktok'
              : hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be'
                ? 'youtube'
                : hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')
                  ? 'linkedin'
                  : hostname === 't.me' || hostname === 'telegram.me' || hostname.endsWith('.telegram.me')
                    ? 'telegram'
                    : hostname === 'x.com' || hostname === 'twitter.com'
                      ? 'x'
                      : 'website';
    return { href: url.href, kind };
  } catch {
    return null;
  }
}

function splitContacts(value: string): string[] {
  return [...new Set(
    value
      .split(/[\r\n,;]+|\s+(?=(?:https?:\/\/|www\.|mailto:|tel:))/i)
      .map((contact) => contact.trim().replace(/^(?:email|github|facebook|instagram|whatsapp|tiktok|youtube|linkedin|telegram|x)\s*:\s*/i, ''))
      .filter(Boolean),
  )];
}

export function ContactLink({ value }: { value: string }) {
  const contacts = splitContacts(value);

  return (
    <div className="contact-links" aria-label="Contact links">
      {contacts.map((contact) => {
        const target = getContactTarget(contact);
        const { icon: Icon, color, background } = contactIcons[target?.kind ?? 'website'];

        return (
          <div key={contact} className="contact-link-row">
            <span className="color-icon" style={{ color, backgroundColor: background }} aria-hidden="true">
              <Icon size={15} />
            </span>
            {target ? (
              <a
                href={target.href}
                target={target.href.startsWith('http') ? '_blank' : undefined}
                rel={target.href.startsWith('http') ? 'noreferrer' : undefined}
              >
                {contact}
              </a>
            ) : (
              <span>{contact}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
