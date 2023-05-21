/* eslint-disable jsx-a11y/alt-text */
import { useState } from "react";
import Linkify from "linkify-react";

function App() {
  const linkifyOptions = {};
  const decoder = new TextDecoder("utf-8");
  const [messages, setMessages] = useState([
    {
      content:
        "Ich bin der Gründer:innen Co-Pilot, wie kann ich Ihnen helfen besser zu gründen?",
      role: "assistant",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const handleUpdatePrompt = () => {
    if (customPrompt === "") {
      return;
    }
    sessionStorage.setItem("customPrompt", customPrompt);
  };

  const handleResetPrompt = () => {
    setCustomPrompt("");
    sessionStorage.removeItem("customPrompt");
  };

  const handleCustomPromptChange = (event) => {
    setCustomPrompt(event.target.value);
  };

  const handleNewMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const updateLastMessage = (message) => {
    setMessages((prev) => {
      const newElements = [...prev];
      newElements[newElements.length - 1] = message;
      return newElements;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessage = {
      content: e.target[0].value,
      role: "user",
    };

    handleNewMessage(newMessage);
    setIsTyping(true);
    e.target.reset();

    const promptExtension = sessionStorage.getItem("customPrompt");

    let requestBody = {};
    let withad = false;
    if (messages.length > 4) {
      withad = true;
    }
    if (promptExtension === null || promptExtension === "") {
      requestBody = {
        query: newMessage.content,
        history: messages.slice(-6),
        withAd: withad,
      };
    } else {
      requestBody = {
        query: newMessage.content,
        history: messages.slice(-6),
        promptExtension: promptExtension,
        withAd: withad,
      };
    }

    const response = await fetch("https://fuergruender-stream.fly.dev/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(requestBody),
    });
    if (response.status === 200) {
      let newMessage = { content: "", role: "assistant" };
      handleNewMessage(newMessage);
      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setIsTyping(false);

          break;
        }
        const chunk = decoder.decode(value);
        newMessage.content = newMessage.content + chunk;
        updateLastMessage(newMessage);
      }
    } else if (response.status !== 200) {
      console.error("error getting resource", response.status);
    }
  };
  return (
    <div className="drawer">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <section className="container mx-auto p-5 fixed inset-0">
          <div className="mockup-window border bg-base-300 w-full h-full flex flex-col">
            <div className="p-5 pb-8 flex-grow overflow-auto">
              {messages.length &&
                messages.map((msg, i) => {
                  return (
                    <div
                      className={`chat ${
                        msg.role === "assistant" ? "chat-start" : "chat-end"
                      }`}
                      key={"chatKey" + i}
                    >
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full">
                          <img
                            src={
                              msg.role === "assistant"
                                ? "/images/gruenderheld.png"
                                : "/images/fuergruender.png"
                            }
                          />
                        </div>
                      </div>
                      <div className="chat-bubble">
                        <Linkify as="p" options={linkifyOptions}>
                          {msg.content}
                        </Linkify>
                      </div>
                    </div>
                  );
                })}
            </div>

            <form
              className="form-control m-5 items-center"
              onSubmit={(e) => handleSubmit(e)}
            >
              <div className="input-group max-w-full w-[800px] relative">
                {isTyping && (
                  <small className="absolute -top-5 left-0.5 animate-pulse">
                    Gründerbot ist am tippen...
                  </small>
                )}
                <label
                  htmlFor="my-drawer-4"
                  className="drawer-button btn btn-square"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </svg>
                </label>

                <input
                  type="text"
                  placeholder="Stellen Sie Ihre Frage"
                  className="input input-bordered flex-grow font-gruender"
                  required
                />
                <button className="btn btn-square" type="submit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer-4" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Benutzerdefinierter Prompt</span>
              </label>
              <textarea
                onChange={handleCustomPromptChange}
                value={customPrompt}
                className="textarea textarea-bordered h-40"
                placeholder="Beispiel: Deine Antwort sollte ausführlich und professionell sein."
              ></textarea>
              <button onClick={handleUpdatePrompt} className="btn btn-sm">
                update Prompt
              </button>
              <button
                onClick={handleResetPrompt}
                className="btn btn-sm btn-secondary"
              >
                reset prompt
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
