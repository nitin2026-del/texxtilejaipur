const TOKEN = 'EAAZBZCGgHEg0MBSFRrKFOhXo7TKHevp8UpEH3WRsFMun0fUaAeLeHGWkqAZA5lhKgQ8ommGuOZAkAZBJeolEF80ZBgEbAS2zjEB1bHo7oZCpmYStU2C0r7FbY9Yob03pDMJiO4GXW21kMS6SEj7uqOrjbNGRPNGy2il87PXh9TSWOpuXuaukOe7nohZCZC0k0TuXpoAZDZD';

async function test() {
  const accountsRes = await fetch('https://graph.facebook.com/v20.0/me/adaccounts?access_token=' + TOKEN).then(r => r.json());
  console.log(accountsRes);
}
test();
