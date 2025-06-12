async function ask() {
    const question = document.getElementById('question').value;
    const res = await fetch('http://localhost:3000/api/ask', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: question })
    });
    const data = await res.json();
    document.getElementById('answer').innerText = data.answer;
  }
  