// Edit this file to re-label the entire site. The header, footer, homepage,
// and SEO defaults all read from here instead of hardcoding copy.
// (The site's actual navigation links come live from WordPress — see
// src/lib/wordpress.js and src/components/Header.astro.)
export const SITE = {
  name: 'Susanta',
  role: 'Notes on English usage, markets, and building on the web',
  email: 'you@example.com',
  tagline: 'I build fast websites for your business and handle all the tech for you.',
  description: 'You get more customers and revenue. I manage the speed, SEO, and updates',
  status: 'Powered by WordPress + Astro',
  social: [
    // Add or remove as needed. Each shows up in the footer.
    // { label: 'GitHub', href: 'https://github.com/your-username' },
  ] as { label: string; href: string }[],
  locale: 'en',
} as const;
