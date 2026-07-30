const TOKEN = 'EAAZBZCGgHEg0MBSFRrKFOhXo7TKHevp8UpEH3WRsFMun0fUaAeLeHGWkqAZA5lhKgQ8ommGuOZAkAZBJeolEF80ZBgEbAS2zjEB1bHo7oZCpmYStU2C0r7FbY9Yob03pDMJiO4GXW21kMS6SEj7uqOrjbNGRPNGy2il87PXh9TSWOpuXuaukOe7nohZCZC0k0TuXpoAZDZD';

async function analyze() {
  try {
    const accountsRes = await fetch('https://graph.facebook.com/v20.0/me/adaccounts?access_token=' + TOKEN).then(r => r.json());
    const timeRange = encodeURIComponent(JSON.stringify({since: '2026-07-06', until: '2026-07-29'}));

    for (const account of accountsRes.data) {
      console.log('--- Overall Account Performance ---');
      const url = `https://graph.facebook.com/v20.0/${account.id}/insights?fields=spend,impressions,reach,frequency,clicks,inline_link_clicks,cpc,cpm,ctr,inline_link_click_ctr,actions&time_range=${timeRange}&access_token=${TOKEN}`;
      const res = await fetch(url).then(r => r.json());
      if (res.data && res.data.length > 0) {
        console.log(JSON.stringify(res.data[0], null, 2));
      }
      
      console.log('\n--- Breakdown by Placement (Platform) ---');
      const platUrl = `https://graph.facebook.com/v20.0/${account.id}/insights?fields=impressions,inline_link_clicks,spend,actions&breakdowns=publisher_platform&time_range=${timeRange}&access_token=${TOKEN}`;
      const platRes = await fetch(platUrl).then(r => r.json());
      if (platRes.data) {
         console.log(JSON.stringify(platRes.data, null, 2));
      }

      console.log('\n--- Breakdown by Age ---');
      const ageUrl = `https://graph.facebook.com/v20.0/${account.id}/insights?fields=impressions,inline_link_clicks,spend,actions&breakdowns=age&time_range=${timeRange}&access_token=${TOKEN}`;
      const ageRes = await fetch(ageUrl).then(r => r.json());
      if (ageRes.data) {
         console.log(JSON.stringify(ageRes.data, null, 2));
      }
    }
  } catch (err) {
    console.error(err);
  }
}
analyze();
