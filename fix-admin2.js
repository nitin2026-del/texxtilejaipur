const fs = require('fs');
const path = 'c:/Users/91787/Desktop/nitin/indithread/src/app/admin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const target1 = `  // 🔒 ACCESS DENIED GATE
  if (!user || profile?.role !== 'admin') {
    if (!user) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">`;

const replace1 = `  // 🔒 ACCESS DENIED GATE
  const isDenied = !user || profile?.role !== 'admin';

  return (
    <>
      {isDenied && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          {!user ? (
            <div className="min-h-screen bg-[#FDFBF7] text-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">`;

const target2 = `            </div>
          </div>
        </div>
      );
    }
  }

  // Calculate quick metrics`;

const replace2 = `            </div>
          </div>
        </div>
          )}
        </div>
      )}

  // Calculate quick metrics`;

const target3 = `  return (
    <main className="min-h-screen text-zinc-900 pb-24 relative">`;

const replace3 = `    <main className="min-h-screen text-zinc-900 pb-24 relative">`;

const target4 = `      {/* Main Container */}
      <div className="max-w-7xl mx-auto pt-28 px-6 space-y-8">`;

const replace4 = `      {/* Main Container */}
      <div className={\`max-w-7xl mx-auto pt-28 px-6 space-y-8 \${isDenied ? 'opacity-0 pointer-events-none' : ''}\`}>`;

const target5 = `    </main>
  );
}`;

const replace5 = `    </main>
    </>
  );
}`;

if (content.includes(target1)) content = content.replace(target1, replace1);
else console.log("target1 failed");

if (content.includes(target2)) content = content.replace(target2, replace2);
else console.log("target2 failed");

if (content.includes(target3)) content = content.replace(target3, replace3);
else console.log("target3 failed");

if (content.includes(target4)) content = content.replace(target4, replace4);
else console.log("target4 failed");

if (content.includes(target5)) content = content.replace(target5, replace5);
else console.log("target5 failed");

fs.writeFileSync(path, content, 'utf8');
console.log('Done!');
