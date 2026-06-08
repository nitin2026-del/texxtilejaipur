const fs = require('fs');
let content = fs.readFileSync('indithread/src/components/CheckoutModal.tsx', 'utf8');

content = content.replace(/bg-zinc-800\/80/g, 'bg-white');
content = content.replace(/bg-zinc-900\/50/g, 'bg-white');
content = content.replace(/bg-zinc-900\/40/g, 'bg-white');
content = content.replace(/bg-zinc-800\/40/g, 'bg-white');
content = content.replace(/bg-zinc-800/g, 'bg-white');
content = content.replace(/bg-zinc-900/g, 'bg-white');

content = content.replace(/border-zinc-700/g, 'border-zinc-300');
content = content.replace(/border-zinc-800/g, 'border-zinc-300');

content = content.replace(/text-white/g, 'text-zinc-900');
content = content.replace(/text-zinc-400/g, 'text-zinc-600');
content = content.replace(/text-zinc-300/g, 'text-zinc-800');
content = content.replace(/text-zinc-100/g, 'text-zinc-800');
// keep placeholder-zinc-500 intact
content = content.replace(/text-zinc-500/g, 'text-zinc-500');

const COUNTRIES = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];
const countryOptions = COUNTRIES.map(c => '<option value="' + c + '">' + c + '</option>').join('\n                    ');

const countryRegex = /<select[\s\S]*?onChange=\{\(e\) => setCountry\(e\.target\.value\)\}[\s\S]*?<\/select>/;
const newSelect = `<select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 focus:outline-none focus:border-gold"
                  >
                    ${countryOptions}
                  </select>`;

content = content.replace(countryRegex, newSelect);
content = content.replace(/border-luxury glow-border/g, 'border-zinc-200 shadow-2xl');

fs.writeFileSync('indithread/src/components/CheckoutModal.tsx', content);
console.log('Fixed checkout modal to light theme.');
