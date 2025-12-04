async function send() {
    const box = document.getElementById("inp");
    const chat = document.getElementById("chat");

    const userText = box.value.trim();
    if (!userText) return;

    chat.innerHTML += `<div class="msg user">You: ${userText}</div>`;
    box.value = "";

    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText })
    });

    const data = await res.json();
    chat.innerHTML += `<div class="msg bot">AI: ${data.reply}</div>`;
}
