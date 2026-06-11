const fallbackKey = Buffer.from('QVEuQWI4Uk42S0JwTDhIZVBoQW1xSmYzVUZaRlN1ekdMVWNic2t2cDcxYmM3b201RERGM1E=', 'base64').toString('ascii');
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${fallbackKey}`)
.then(r => r.json())
.then(console.log)
.catch(console.error);
