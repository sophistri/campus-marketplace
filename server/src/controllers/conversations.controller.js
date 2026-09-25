import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Listing from '../models/Listing.js';

import jwt from 'jsonwebtoken';

// GET /api/conversations — all conversations the logged-in user is part of
export async function getConversations(req, res) {
  const conversations = await Conversation.find({
    $or: [{ buyer: req.userId }, { seller: req.userId }],
  })
    .populate('listing', 'title price photos status')
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .sort({ updatedAt: -1 });

  // attach last message + unread count for each, so the list view has what it needs
  const withMeta = await Promise.all(
    conversations.map(async (conversation) => {
      const lastMessage = await Message.findOne({ conversation: conversation._id })
        .sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        conversation: conversation._id,
        sender: { $ne: req.userId },
        readAt: null,
      });

      return {
        ...conversation.toObject(),
        lastMessage,
        unreadCount,
      };
    })
  );

  res.json({ conversations: withMeta });
}

// POST /api/conversations — start (or reuse) a conversation about a listing
export async function startConversation(req, res) {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (listing.seller.toString() === req.userId) {
    return res.status(400).json({ error: "You can't message yourself about your own listing" });
  }

  let conversation = await Conversation.findOne({
    listing: listingId,
    buyer: req.userId,
    seller: listing.seller,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      listing: listingId,
      buyer: req.userId,
      seller: listing.seller,
    });
  }

  res.status(201).json({ conversation });
}

// GET /api/conversations/:id/messages
export async function getMessages(req, res) {
  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const isParticipant = [conversation.buyer.toString(), conversation.seller.toString()].includes(req.userId);
  if (!isParticipant) {
    return res.status(403).json({ error: 'Not your conversation' });
  }

  const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });

  // mark messages sent by the other person as read
  await Message.updateMany(
    { conversation: conversation._id, sender: { $ne: req.userId }, readAt: null },
    { readAt: new Date() }
  );

  res.json({ messages });
}

// POST /api/conversations/:id/messages
export async function sendMessage(req, res) {
  const { body } = req.body;
  if (!body?.trim()) {
    return res.status(400).json({ error: 'Message body is required' });
  }

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const isParticipant = [conversation.buyer.toString(), conversation.seller.toString()].includes(req.userId);
  if (!isParticipant) {
    return res.status(403).json({ error: 'Not your conversation' });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: req.userId,
    body: body.trim(),
  });

  // bump conversation's updatedAt so it sorts to the top of the list
  conversation.updatedAt = new Date();
  await conversation.save();

  res.status(201).json({ message });
}