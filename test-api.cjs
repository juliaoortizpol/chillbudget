const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log("1. Signup / Login...");
  const authOpts = {
    hostname: 'localhost', port: 3000, path: '/auth/signup', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  };
  let res = await request(authOpts, { email: 'testbug2@example.com', password: 'password123' });
  authOpts.path = '/auth/login';
  res = await request(authOpts, { email: 'testbug2@example.com', password: 'password123' });
  
  const token = res.data.access_token;
  if (!token) return console.log("Failed to get token", res);
  
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  
  console.log("2. Create a budget...");
  res = await request({ hostname: 'localhost', port: 3000, path: '/budgets', method: 'POST', headers }, {
    name: "Test Budget", periodType: "monthly", startDate: new Date().toISOString(), endDate: new Date().toISOString(), status: "active"
  });
  console.log("Budget created:", res.status);
  const budgetId = res.data._id;
  
  console.log("3. Create 1st category...");
  res = await request({ hostname: 'localhost', port: 3000, path: '/categories', method: 'POST', headers }, {
    name: "Cat 1", type: "expense", icon: "default", color: "#111"
  });
  console.log("Cat 1 created:", res.status);
  const cat1Id = res.data._id;
  
  console.log("4. Add 1st category to budget...");
  res = await request({ hostname: 'localhost', port: 3000, path: `/budgets/${budgetId}`, method: 'PATCH', headers }, {
    items: [{ expenseCategoryId: cat1Id, plannedAmount: 100 }]
  });
  console.log("Budget updated:", res.status, JSON.stringify(res.data, null, 2));
  
  const itemId = res.data.items[0]._id;
  
  console.log("5. Edit 1st category amount...");
  res = await request({ hostname: 'localhost', port: 3000, path: `/budgets/${budgetId}/items/${itemId}`, method: 'PATCH', headers }, {
    plannedAmount: 150
  });
  console.log("Budget Item updated:", res.status, res.data);
  
  console.log("6. Create 2nd category...");
  res = await request({ hostname: 'localhost', port: 3000, path: '/categories', method: 'POST', headers }, {
    name: "Cat 2", type: "expense", icon: "default", color: "#222"
  });
  console.log("Cat 2 created:", res.status, res.data);
  const cat2Id = res.data._id;
  
  console.log("7. Add 2nd category to budget...");
  res = await request({ hostname: 'localhost', port: 3000, path: `/budgets/${budgetId}`, method: 'PATCH', headers }, {
    items: [{ expenseCategoryId: cat2Id, plannedAmount: 200 }]
  });
  console.log("Budget updated with 2nd cat:", res.status, JSON.stringify(res.data, null, 2));
}

run().catch(console.error);
