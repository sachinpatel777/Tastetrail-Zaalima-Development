// Simple registration smoke test using Node fetch
(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo User',
        email: 'demo.user@example.com',
        password: 'test123'
      })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
    process.exit(res.ok ? 0 : 1);
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();