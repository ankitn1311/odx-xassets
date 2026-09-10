'use client';
import React from 'react';

const LINKS = [
  { label: 'Docs', href: 'https://docs.odx.so' },
  { label: 'Discord', href: 'https://discord.gg/9r7sU8H23H' },
  { label: 'X', href: 'https://x.com/ODXLabs' },
  { label: 'Telegram', href: 'https://t.me/odxlabs' },
  { label: 'Medium', href: 'https://medium.com/@odx' },
];

export default function AppFooter() {
  return (
    <footer className="z-10 hidden shrink-0 border-t border-border md:block">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} ODX Labs</span>
        <nav className="flex items-center gap-5">
          {LINKS.map(l => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
