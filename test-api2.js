fetch('https://wajirabackend.hawk-dev.com/wapi/transaction/unit-transaction/unit-transaction?type=purchase&is_paid=true&sort_order=desc&start_date=2026-03-04&end_date=2026-03-06&person_id=1', {
  headers: {
    'Accept': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log("Total length:", data.data.data.length);
  if(data.data.data.length > 0) {
     console.log("First created_at:", data.data.data[0].created_at);
     console.log("First person_id:", data.data.data[0].person_id);
  } else {
     console.log(data);
  }
})
.catch(err => console.error(err));
