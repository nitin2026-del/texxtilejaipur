const fs = require('fs');
let content = fs.readFileSync('indithread/src/components/CheckoutModal.tsx', 'utf8');

const COUNTRIES = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'];

if (!content.includes('const COUNTRIES = [')) {
  content = content.replace('export const CheckoutModal', 'const COUNTRIES = ' + JSON.stringify(COUNTRIES) + ';\n\nexport const CheckoutModal');
}

if (!content.includes('countrySearch')) {
  content = content.replace(
    "const [country, setCountry] = useState('United States');",
    "const [country, setCountry] = useState('United States');\n  const [countrySearch, setCountrySearch] = useState('');\n  const [showCountryDropdown, setShowCountryDropdown] = useState(false);"
  );
}

const selectRegex = /<div>\s*<label className="block text-xs font-semibold text-zinc-600 mb-1">Country<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>/;

const newDropdown = `
                <div className="relative">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1">Country</label>
                  <div 
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full bg-white border border-zinc-300 rounded py-2 px-3 text-sm text-zinc-900 cursor-pointer flex justify-between items-center focus-within:border-gold"
                  >
                    <span>{country || 'Select Country'}</span>
                    <span className="text-zinc-400 text-xs">▼</span>
                  </div>
                  
                  {showCountryDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-zinc-300 rounded shadow-2xl max-h-48 flex flex-col overflow-hidden">
                      <input 
                        type="text" 
                        autoFocus
                        placeholder="Search country..." 
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full border-b border-zinc-200 py-2 px-3 text-sm text-zinc-900 focus:outline-none bg-zinc-50"
                      />
                      <div className="overflow-y-auto">
                        {COUNTRIES.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                          <div 
                            key={c}
                            onClick={() => {
                              setCountry(c);
                              setShowCountryDropdown(false);
                              setCountrySearch('');
                            }}
                            className="py-2 px-3 text-sm text-zinc-800 hover:bg-gold/10 hover:text-gold cursor-pointer transition-colors"
                          >
                            {c}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>`;

content = content.replace(selectRegex, newDropdown);

fs.writeFileSync('indithread/src/components/CheckoutModal.tsx', content);
console.log('Searchable dropdown added');
