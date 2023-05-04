import { useState } from "react";
import Linkify from "linkify-react";

function App() {
  const linkifyOptions = {};
  const decoder = new TextDecoder("utf-8");
  const [messages, setMessages] = useState([
    {
      content: "Ich bin der Gründer Copilot und helfe Ihnen besser zu gründen!",
      role: "assistant",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

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

    const response = await fetch("https://fuergruender-stream.fly.dev/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        query: newMessage.content,
      }),
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
                            ? "/images/gptFemale.jpg"
                            : "/images/anakin.webp"
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

            <input
              type="text"
              placeholder="Stellen sie ihre Frage"
              className="input input-bordered flex-grow"
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
  );
}

export default App;
