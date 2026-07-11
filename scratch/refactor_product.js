const fs = require('fs');

const path = 'src/app/product/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Rename function and add props
content = content.replace('export default function ProductPage() {', 
  'export function ProductPageClient({ product, relatedProducts, initialReviews }: { product: any, relatedProducts: any[], initialReviews: any[] }) {');

// 2. Remove useParams, usePathname
content = content.replace('const params = useParams();\n  const router = useRouter();\n  const { id } = params;\n', '');
// Fix any router usage if needed, or leave useRouter import

// 3. Remove product, loading, relatedProducts, dynamicReviews useState
content = content.replace(/const \[product, setProduct\] = useState<Product \| null>\(null\);\n  const \[loading, setLoading\] = useState\(true\);\n/g, '');
content = content.replace(/const \[relatedProducts, setRelatedProducts\] = useState<any\[\]>\(\[\]\);\n/g, '');
content = content.replace(/const \[dynamicReviews, setDynamicReviews\] = useState<any\[\]>\(\[\]\);\n/g, 'const [dynamicReviews, setDynamicReviews] = useState<any[]>(initialReviews);\n');

// 4. Remove localStorage product caching logic
content = content.replace(/useEffect\(\(\) => \{\n    try \{\n      const cached = localStorage\.getItem\('textilejaipur_collection_cache'\);\n[\s\S]*?\} catch \(e\) \{\}\n  \}, \[id\]\);\n/g, '');

// 5. Remove the massive fetchProduct useEffect and fetchRelated useEffects
// We can use a regex to match from `useEffect(() => { const fetchProduct = async () => {` until the end of that useEffect.
// Since it's large, we might just look for it by string manipulation
const fetchIndex = content.indexOf('  useEffect(() => {\n    const fetchProduct = async () => {\n');
if (fetchIndex !== -1) {
    // Find the end of this useEffect. It ends just before `useEffect(() => { const fetchReviews = async () => {`
    const nextUseEffect = content.indexOf('  useEffect(() => {\n    const fetchReviews = async () => {', fetchIndex);
    if (nextUseEffect !== -1) {
        content = content.substring(0, fetchIndex) + content.substring(nextUseEffect);
    }
}

const fetchReviewsIndex = content.indexOf('  useEffect(() => {\n    const fetchReviews = async () => {');
if (fetchReviewsIndex !== -1) {
    // Ends before `const handleAddToCart`
    const handleAddToCartIndex = content.indexOf('  const handleAddToCart = () => {', fetchReviewsIndex);
    if (handleAddToCartIndex !== -1) {
        content = content.substring(0, fetchReviewsIndex) + content.substring(handleAddToCartIndex);
    }
}

// Write to components
fs.writeFileSync('src/components/ProductPageClient.tsx', content, 'utf8');
console.log('Done refactoring!');
