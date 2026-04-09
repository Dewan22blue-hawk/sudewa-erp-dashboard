const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('https://wajirabackend.hawk-dev.com/wapi/transaction/unit-transaction/unit-transaction', {
      params: {
        type: 'purchase',
        is_paid: true,
        sort_order: 'desc',
        start_date: '2026-03-04',
        end_date: '2026-03-06',
        person_id: 1,
      }
    });
    console.log("Status:", res.status);
    console.log("Total received:", res.data.data.data.length);
    if (res.data.data.data.length > 0) {
      console.log("First item created_at:", res.data.data.data[0].created_at);
      console.log("First item person_id:", res.data.data.data[0].person_id);
    }
  } catch (e) {
    console.error(e.message);
  }
}
test();
