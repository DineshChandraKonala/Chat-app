import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function ChatContainer() {
  const { messages, selectedUser, setSelectedUser, sendMessages, getMessages } =
    useContext(ChatContext);
  const { authUser, onlineUser } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (input.trim() === "") return;
    try {
      await sendMessages(input.trim());
      setInput("");
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleSendImage = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await sendMessages({ image: reader.result });
        event.target.value = "";
      } catch (err) {
        toast.error("Failed to send image");
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages().catch((err) => {
        console.error("Error fetching messages:", err);
        toast.error("Failed to load messages");
      });
    }
  }, [selectedUser, getMessages]);

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.profile_martin}
          alt="User"
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUser.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="md:hidden w-5 cursor-pointer"
        />
        <img src={assets.help_icon} alt="Help" className="max-md:hidden w-5" />
      </div>

      {/* Messages */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-auto p-3 pb-6">
        {messages.length === 0 ? (
          <p className="text-center text-white mt-4">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isSender = msg.senderId === authUser._id;

            return (
              <div
                key={msg._id || msg.createdAt}
                className={`flex mb-2 ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex items-end gap-2 ${
                    isSender ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  {/* Message Bubble */}
                  {msg.content?.image ? (
                    <img
                      src={msg.content.image}
                      alt="sent"
                      className="w-[200px] h-[200px] object-cover rounded-lg"
                    />
                  ) : (
                    <p
                      className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg break-words text-white bg-violet-500/30 ${
                        isSender ? "rounded-br-none" : "rounded-bl-none"
                      }`}
                    >
                      {msg.content?.text || "[Message]"}
                    </p>
                  )}

                  {/* Avatar + Time */}
                  <div className="text-center text-xs">
                    <img
                      src={
                        isSender
                          ? authUser?.profilePic || assets.avatar_icon
                          : selectedUser?.profilePic || assets.avatar_icon
                      }
                      alt="avatar"
                      className="w-7 h-7 object-cover rounded-full"
                    />
                    <p className="text-gray-400">{formatMessageTime(msg.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom input */}
      <form
        onSubmit={handleSendMessage}
        className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/30"
      >
        <div className="flex flex-1 items-center bg-gray-100/10 px-3 rounded-full">
          <input
            type="text"
            placeholder="Send a message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 text-sm p-3 border-none outline-none bg-transparent text-white placeholder:text-gray-400"
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            hidden
            onChange={handleSendImage}
          />
          <label htmlFor="image" className="cursor-pointer">
            <img src={assets.gallery_icon} alt="upload" className="w-5 mr-2" />
          </label>
        </div>
        <button type="submit" className="cursor-pointer">
          <img src={assets.send_button} alt="send" className="w-7" />
        </button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden h-full">
      <img src={assets.logo_icon} alt="logo" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat Anytime Anywhere</p>
    </div>
  );
}
