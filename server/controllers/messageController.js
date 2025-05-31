import Message from "../models/message.js";
import User from "../models/user.js";

export const getUsersForSideBar = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const users = await User.find({ _id: { $ne: currentUserId } })
      .select("-password -__v")
      .lean();

    // Get unseen messages count
    const unseenMessages = {};
    for (const user of users) {
      const count = await Message.countDocuments({
        senderId: user._id,
        receiverId: currentUserId,
        seen: false
      });
      if (count > 0) {
        unseenMessages[user._id] = count;
      }
    }

    res.status(200).json({
      success: true,
      users,
      unseenMessages
    });

  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get users" 
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body; // expect { text, image }
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!content || (!content.text && !content.image)) {
      return res.status(400).json({ success: false, message: "Message content required" });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      seen: false
    });

    res.status(201).json({
      success: true,
      newMessage
    });

  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send message" 
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages
    });

  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get messages" 
    });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    await Message.findByIdAndUpdate(messageId, {
      seen: true
    });

    res.status(200).json({
      success: true,
      message: "Message marked as seen"
    });

  } catch (error) {
    console.error("Mark message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark message as seen" 
    });
  }
};