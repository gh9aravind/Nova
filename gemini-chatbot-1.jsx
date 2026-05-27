import { useState, useRef, useEffect } from "react";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Exo+2:wght@300;400;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-void: #030508;
    --bg-deep: #080d14;
    --bg-panel: #0c1420;
    --bg-card: #101a28;
    --red-core: #e8001e;
    --red-glow: #ff1a35;
    --red-dim: #5a000d;
    --blue-core: #0057ff;
    --blue-glow: #3d8bff;
    --blue-dim: #001a4d;
    --blue-bright: #60a5fa;
    --text-primary: #e8f4ff;
    --text-secondary: #7a9abf;
    --text-dim: #3a5570;
    --border-subtle: rgba(0,87,255,0.15);
    --border-active: rgba(0,87,255,0.4);
  }

  body { background: var(--bg-void); font-family: 'Exo 2', sans-serif; }

  .app {
    min-height: 100vh;
    background: var(--bg-void);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,57,180,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 90% 80%, rgba(180,0,30,0.08) 0%, transparent 60%);
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    position: relative;
    overflow: hidden;
  }

  .grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,87,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,87,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* ── API KEY SCREEN ── */
  .setup-screen {
    position: fixed; inset: 0; z-index: 50;
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-void);
    background-image: radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,57,180,0.1) 0%, transparent 70%);
  }

  .setup-card {
    width: 100%; max-width: 480px; padding: 48px 40px;
    background: var(--bg-panel);
    border: 1px solid var(--border-active);
    position: relative; overflow: hidden;
    clip-path: polygon(0 0, calc(100% - 24px) 0, 100% 24px, 100% 100%, 24px 100%, 0 calc(100% - 24px));
  }

  .setup-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--red-core), var(--blue-core));
  }

  .setup-card::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,87,255,0.06) 0%, transparent 70%);
  }

  .logo-area { text-align: center; margin-bottom: 36px; }

  .logo-icon {
    width: 64px; height: 64px; margin: 0 auto 16px;
    background: linear-gradient(135deg, var(--red-core), var(--blue-core));
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    box-shadow: 0 0 30px rgba(0,87,255,0.4), 0 0 60px rgba(232,0,30,0.2);
    animation: pulse-logo 3s ease-in-out infinite;
  }

  @keyframes pulse-logo {
    0%, 100% { box-shadow: 0 0 30px rgba(0,87,255,0.4), 0 0 60px rgba(232,0,30,0.2); }
    50% { box-shadow: 0 0 50px rgba(0,87,255,0.7), 0 0 80px rgba(232,0,30,0.4); }
  }

  .logo-title {
    font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700;
    letter-spacing: 4px; text-transform: uppercase;
    background: linear-gradient(90deg, var(--red-glow), var(--text-primary), var(--blue-glow));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .logo-sub {
    font-family: 'Share Tech Mono', monospace; font-size: 11px;
    color: var(--text-secondary); letter-spacing: 3px; text-transform: uppercase;
    margin-top: 6px;
  }

  .setup-label {
    display: block; font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase; color: var(--blue-bright); margin-bottom: 10px;
  }

  .setup-input {
    width: 100%; padding: 14px 18px;
    background: var(--bg-deep); border: 1px solid var(--border-active);
    color: var(--text-primary); font-family: 'Share Tech Mono', monospace; font-size: 13px;
    outline: none; transition: all 0.2s;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%);
  }

  .setup-input:focus {
    border-color: var(--blue-core);
    box-shadow: 0 0 0 1px var(--blue-core), 0 0 20px rgba(0,87,255,0.2);
  }

  .setup-hint {
    margin-top: 10px; font-size: 12px; color: var(--text-dim);
    font-family: 'Share Tech Mono', monospace;
  }

  .setup-hint a { color: var(--blue-glow); text-decoration: none; }
  .setup-hint a:hover { text-decoration: underline; }

  .btn-launch {
    width: 100%; margin-top: 28px; padding: 16px;
    background: linear-gradient(90deg, var(--red-core), #8b00ff, var(--blue-core));
    background-size: 200% 100%;
    border: none; cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700;
    letter-spacing: 4px; text-transform: uppercase; color: white;
    clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
    transition: all 0.3s; position: relative; overflow: hidden;
    animation: btn-gradient 4s ease infinite;
  }

  @keyframes btn-gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  .btn-launch:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(232,0,30,0.4), 0 8px 30px rgba(0,87,255,0.4);
  }

  .btn-launch:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ── HEADER ── */
  .header {
    position: relative; z-index: 10;
    padding: 0 24px;
    height: 64px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid var(--border-subtle);
    background: linear-gradient(180deg, rgba(8,13,20,0.95) 0%, rgba(8,13,20,0.8) 100%);
    backdrop-filter: blur(12px);
  }

  .header::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--red-core) 30%, var(--blue-core) 70%, transparent);
    opacity: 0.6;
  }

  .header-brand {
    display: flex; align-items: center; gap: 12px;
  }

  .header-hex {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, var(--red-core), var(--blue-core));
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex; align-items: center; justify-content: center; font-size: 16px;
    box-shadow: 0 0 16px rgba(0,87,255,0.5);
  }

  .header-title {
    font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700;
    letter-spacing: 3px; text-transform: uppercase;
    background: linear-gradient(90deg, var(--red-glow), var(--text-primary));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .header-status {
    display: flex; align-items: center; gap: 8px;
    font-family: 'Share Tech Mono', monospace; font-size: 11px;
    color: var(--text-secondary); letter-spacing: 1px;
  }

  .status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #00ff88;
    box-shadow: 0 0 8px #00ff88;
    animation: blink 2s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  .header-actions { display: flex; gap: 8px; }

  .btn-icon {
    width: 36px; height: 36px; background: var(--bg-card);
    border: 1px solid var(--border-subtle); cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; color: var(--text-secondary);
    transition: all 0.2s; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }

  .btn-icon:hover {
    border-color: var(--blue-core); color: var(--blue-glow);
    background: var(--blue-dim); box-shadow: 0 0 12px rgba(0,87,255,0.3);
  }

  /* ── MESSAGES ── */
  .messages-area {
    flex: 1; overflow-y: auto; padding: 24px;
    display: flex; flex-direction: column; gap: 20px;
    position: relative; z-index: 1;
  }

  .messages-area::-webkit-scrollbar { width: 4px; }
  .messages-area::-webkit-scrollbar-track { background: transparent; }
  .messages-area::-webkit-scrollbar-thumb { background: var(--blue-dim); border-radius: 2px; }

  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; gap: 16px; padding: 40px;
    animation: fade-in 0.6s ease;
  }

  .empty-hex {
    width: 80px; height: 80px;
    background: linear-gradient(135deg, rgba(232,0,30,0.15), rgba(0,87,255,0.15));
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex; align-items: center; justify-content: center;
    font-size: 36px; margin-bottom: 8px;
    border: 1px solid var(--border-active);
    animation: rotate-hex 10s linear infinite;
  }

  @keyframes rotate-hex {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .empty-title {
    font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase;
    background: linear-gradient(90deg, var(--red-glow), var(--blue-glow));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .empty-sub { color: var(--text-secondary); font-size: 14px; line-height: 1.7; max-width: 340px; }

  .suggestions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 12px; }

  .suggestion-pill {
    padding: 8px 16px; background: var(--bg-card);
    border: 1px solid var(--border-active); cursor: pointer;
    font-size: 12px; color: var(--blue-bright); transition: all 0.2s;
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
    font-family: 'Share Tech Mono', monospace;
  }

  .suggestion-pill:hover {
    background: var(--blue-dim); border-color: var(--blue-glow);
    box-shadow: 0 0 12px rgba(0,87,255,0.3);
  }

  /* message bubble */
  .message { display: flex; gap: 12px; animation: msg-in 0.3s ease; max-width: 85%; }

  @keyframes msg-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .message.user { align-self: flex-end; flex-direction: row-reverse; }
  .message.ai { align-self: flex-start; }

  .msg-avatar {
    width: 36px; height: 36px; flex-shrink: 0;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex; align-items: center; justify-content: center; font-size: 16px;
  }

  .message.user .msg-avatar {
    background: linear-gradient(135deg, var(--red-dim), var(--red-core));
    box-shadow: 0 0 12px rgba(232,0,30,0.5);
  }

  .message.ai .msg-avatar {
    background: linear-gradient(135deg, var(--blue-dim), var(--blue-core));
    box-shadow: 0 0 12px rgba(0,87,255,0.5);
  }

  .msg-body { display: flex; flex-direction: column; gap: 4px; }

  .msg-label {
    font-family: 'Share Tech Mono', monospace; font-size: 10px;
    text-transform: uppercase; letter-spacing: 2px;
  }

  .message.user .msg-label { color: var(--red-glow); text-align: right; }
  .message.ai .msg-label { color: var(--blue-glow); }

  .msg-bubble {
    padding: 14px 18px; line-height: 1.7; font-size: 14px;
    position: relative;
  }

  .message.user .msg-bubble {
    background: linear-gradient(135deg, rgba(232,0,30,0.12), rgba(232,0,30,0.06));
    border: 1px solid rgba(232,0,30,0.3);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
    color: var(--text-primary);
  }

  .message.ai .msg-bubble {
    background: linear-gradient(135deg, rgba(0,87,255,0.1), rgba(0,87,255,0.04));
    border: 1px solid var(--border-active);
    clip-path: polygon(14px 0, 100% 0, 100% 100%, 0 100%, 0 14px);
    color: var(--text-primary);
  }

  .msg-bubble p { margin-bottom: 8px; }
  .msg-bubble p:last-child { margin-bottom: 0; }
  .msg-bubble code {
    background: rgba(0,87,255,0.15); border: 1px solid var(--border-active);
    padding: 2px 6px; border-radius: 2px; font-family: 'Share Tech Mono', monospace;
    font-size: 12px; color: var(--blue-bright);
  }
  .msg-bubble pre {
    background: var(--bg-deep); border: 1px solid var(--border-active);
    padding: 12px; margin: 8px 0; overflow-x: auto;
    font-family: 'Share Tech Mono', monospace; font-size: 12px; color: var(--blue-bright);
  }

  /* typing */
  .typing-indicator { display: flex; gap: 5px; padding: 6px 4px; }
  .typing-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--blue-glow); animation: typing 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: 0.2s; background: #8844ff; }
  .typing-dot:nth-child(3) { animation-delay: 0.4s; background: var(--red-glow); }

  @keyframes typing {
    0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
    30% { transform: translateY(-8px); opacity: 1; }
  }

  /* ── INPUT AREA ── */
  .input-area {
    position: relative; z-index: 10;
    padding: 16px 24px 20px;
    background: linear-gradient(0deg, rgba(8,13,20,0.98) 0%, rgba(8,13,20,0.7) 100%);
    backdrop-filter: blur(16px);
    border-top: 1px solid var(--border-subtle);
  }

  .input-area::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--blue-core) 30%, var(--red-core) 70%, transparent);
    opacity: 0.5;
  }

  .input-row {
    display: flex; gap: 10px; align-items: flex-end;
  }

  .input-wrap {
    flex: 1; position: relative;
    background: var(--bg-panel);
    border: 1px solid var(--border-active);
    clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
    transition: all 0.2s;
  }

  .input-wrap:focus-within {
    border-color: var(--blue-core);
    box-shadow: 0 0 0 1px var(--blue-core), 0 0 24px rgba(0,87,255,0.2);
  }

  .chat-input {
    width: 100%; padding: 14px 18px;
    background: transparent; border: none;
    color: var(--text-primary); font-family: 'Exo 2', sans-serif; font-size: 14px;
    outline: none; resize: none; max-height: 120px; min-height: 48px;
    line-height: 1.5;
  }

  .chat-input::placeholder { color: var(--text-dim); }

  .input-meta {
    padding: 0 18px 8px;
    display: flex; justify-content: space-between; align-items: center;
  }

  .char-count {
    font-family: 'Share Tech Mono', monospace; font-size: 10px;
    color: var(--text-dim); letter-spacing: 1px;
  }

  .input-hint {
    font-family: 'Share Tech Mono', monospace; font-size: 10px;
    color: var(--text-dim);
  }

  .btn-send {
    width: 52px; height: 52px; flex-shrink: 0;
    background: linear-gradient(135deg, var(--red-core), var(--blue-core));
    border: none; cursor: pointer;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
    display: flex; align-items: center; justify-content: center; font-size: 20px;
    transition: all 0.2s; position: relative; overflow: hidden;
  }

  .btn-send::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--blue-core), var(--red-core));
    opacity: 0; transition: opacity 0.3s;
  }

  .btn-send:hover::before { opacity: 1; }

  .btn-send:hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(232,0,30,0.5), 0 0 40px rgba(0,87,255,0.3);
  }

  .btn-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

  .btn-send span { position: relative; z-index: 1; }

  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .error-toast {
    padding: 10px 16px; margin-bottom: 12px;
    background: rgba(232,0,30,0.1); border: 1px solid rgba(232,0,30,0.4);
    color: #ff6b80; font-size: 13px;
    font-family: 'Share Tech Mono', monospace; letter-spacing: 0.5px;
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
    animation: msg-in 0.3s ease;
  }
`;

function formatMessage(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("```")) return null;
    if (line.startsWith("**") && line.endsWith("**"))
      return <p key={i} style={{ fontWeight: 600, color: "var(--blue-bright)" }}>{line.slice(2, -2)}</p>;
    if (line.startsWith("* ") || line.startsWith("- "))
      return <p key={i} style={{ paddingLeft: "16px" }}>› {line.slice(2)}</p>;
    if (line === "") return <br key={i} />;
    return <p key={i}>{line}</p>;
  });
}

export default function GeminiChat() {
  const [apiKey, setApiKey] = useState("");
  const [launched, setLaunched] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const adjustTextarea = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";
    setError("");

    const newMessages = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: history,
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(`⚠ ${data.error.message}`);
      } else {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        setMessages([...newMessages, { role: "ai", content: reply }]);
      }
    } catch (e) {
      setError("⚠ Connection failed. Check your API key and network.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError("");
  };

  const suggestions = [
    "🚀 AI ഭാവിയെ കുറിച്ച് പറയൂ",
    "💡 Python tips തരൂ",
    "🎨 Creative ideas വേണം",
    "🌍 Space mystery explain ചെയ്യൂ",
  ];

  if (!launched) {
    return (
      <>
        <style>{styles}</style>
        <div className="setup-screen">
          <div className="setup-card">
            <div className="logo-area">
              <div className="logo-icon">⬡</div>
              <div className="logo-title">NexusAI</div>
              <div className="logo-sub">Powered by Google Gemini</div>
            </div>
            <label className="setup-label">Gemini API Key</label>
            <input
              className="setup-input"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && apiKey.trim() && setLaunched(true)}
            />
            <div className="setup-hint">
              Free API Key:{" "}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer">
                aistudio.google.com
              </a>{" "}
              — Google Account മതി, പണം വേണ്ട!
            </div>
            <button
              className="btn-launch"
              disabled={!apiKey.trim()}
              onClick={() => setLaunched(true)}
            >
              ⚡ Launch NexusAI
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="grid-bg" />

        <header className="header">
          <div className="header-brand">
            <div className="header-hex">⬡</div>
            <span className="header-title">NexusAI</span>
          </div>
          <div className="header-status">
            <div className="status-dot" />
            GEMINI ONLINE
          </div>
          <div className="header-actions">
            <button className="btn-icon" title="Clear chat" onClick={clearChat}>🗑</button>
            <button className="btn-icon" title="Change API key" onClick={() => { setLaunched(false); setMessages([]); }}>⚙</button>
          </div>
        </header>

        <div className="messages-area">
          {messages.length === 0 && !loading ? (
            <div className="empty-state">
              <div className="empty-hex">🤖</div>
              <div className="empty-title">NexusAI Ready</div>
              <p className="empty-sub">
                Gemini AI നിങ്ങളുടെ ചോദ്യങ്ങൾക്ക് ഉത്തരം തരാൻ തയ്യാർ.<br />
                Malayalam ലോ English ലോ ചോദിക്കൂ!
              </p>
              <div className="suggestions">
                {suggestions.map((s) => (
                  <button key={s} className="suggestion-pill" onClick={() => handleSend(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <div key={i} className={`message ${m.role}`}>
                  <div className="msg-avatar">{m.role === "user" ? "👤" : "🤖"}</div>
                  <div className="msg-body">
                    <div className="msg-label">{m.role === "user" ? "YOU" : "NEXUSAI"}</div>
                    <div className="msg-bubble">{formatMessage(m.content)}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message ai">
                  <div className="msg-avatar">🤖</div>
                  <div className="msg-body">
                    <div className="msg-label">NEXUSAI</div>
                    <div className="msg-bubble">
                      <div className="typing-indicator">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={endRef} />
        </div>

        <div className="input-area">
          {error && <div className="error-toast">{error}</div>}
          <div className="input-row">
            <div className="input-wrap">
              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder="ഇവിടെ ടൈപ്പ് ചെയ്യൂ... (Enter = Send, Shift+Enter = New line)"
                value={input}
                onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
                onKeyDown={handleKey}
                rows={1}
              />
              <div className="input-meta">
                <span className="char-count">{input.length} chars</span>
                <span className="input-hint">SHIFT+ENTER = new line</span>
              </div>
            </div>
            <button className="btn-send" onClick={() => handleSend()} disabled={!input.trim() || loading}>
              <span>{loading ? "⟳" : "➤"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
