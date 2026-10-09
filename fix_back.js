const fs = require('fs');
let content = fs.readFileSync('src/components/ProductPageClient.tsx', 'utf8');

// 1. Add const router = useRouter();
const addRouterTarget = 'const pathname = usePathname();';
if (content.includes(addRouterTarget) && !content.includes('const router = useRouter();')) {
  content = content.replace(addRouterTarget, `${addRouterTarget}\n    const router = useRouter();`);
}

// 2. Replace the Link
const oldLink = `<Link 
              href="/collection"
              className="inline-flex items-center gap-2 text-[11px] md:text-xs text-zinc-500 hover:text-[#1a1464] transition-colors uppercase font-bold tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Collection
            </Link>`;

const newButton = `<button 
              onClick={(e) => {
                e.preventDefault();
                if (window.history.length > 2) {
                  router.back();
                } else {
                  router.push('/collection');
                }
              }}
              className="inline-flex items-center gap-2 text-[11px] md:text-xs text-zinc-500 hover:text-[#1a1464] transition-colors uppercase font-bold tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Collection
            </button>`;

if (content.includes(oldLink)) {
  content = content.replace(oldLink, newButton);
  fs.writeFileSync('src/components/ProductPageClient.tsx', content);
  console.log('Successfully fixed Back to Collection button');
} else {
  // Try regex in case of slight spacing differences
  const linkRegex = /<Link\s+href="\/collection"\s+className="inline-flex items-center gap-2 text-\[11px\] md:text-xs text-zinc-500 hover:text-\[\#1a1464\] transition-colors uppercase font-bold tracking-widest"\s*>\s*<ArrowLeft className="h-3\.5 w-3\.5" \/>\s*Back to Collection\s*<\/Link>/m;
  if (linkRegex.test(content)) {
    content = content.replace(linkRegex, newButton);
    fs.writeFileSync('src/components/ProductPageClient.tsx', content);
    console.log('Successfully fixed Back to Collection button (regex)');
  } else {
    console.log('Failed to find Link to replace');
  }
}
