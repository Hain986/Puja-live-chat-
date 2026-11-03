import React from 'react';
import { MessageCircle, Search, MoreHorizontal, CheckCheck } from 'lucide-react';

export const MessagesTab: React.FC = () => {
  const chats = [
    { name: 'Anya', lastMsg: 'Hey, are you joining the stream?', time: '2m ago', unread: 2, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60' },
    { name: 'Sagar', lastMsg: 'Thanks for the gift! 🙏', time: '1h ago', unread: 0, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=60' },
    { name: 'Riya', lastMsg: 'Love Chat is amazing!', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60' },
    { name: 'Love Chat Team', lastMsg: 'Your diamond balance was updated.', time: '2 days ago', unread: 1, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="flex flex-col h-full text-stone-100">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">Messages</h2>
          <MoreHorizontal className="w-6 h-6 text-stone-400" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-stone-900 border border-stone-800 text-sm focus:outline-hidden focus:border-pink-500/50 transition"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20">
        <div className="space-y-1">
          {chats.map((chat, i) => (
            <div
              key={i}
              className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-stone-900 transition cursor-pointer group"
            >
              <div className="relative">
                <img src={chat.avatar} className="w-14 h-14 rounded-2xl object-cover" alt={chat.name} />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-stone-950" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-bold text-stone-100 truncate">{chat.name}</h3>
                  <span className="text-[10px] text-stone-500 font-medium">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <p className={`text-xs truncate ${chat.unread > 0 ? 'text-pink-300 font-bold' : 'text-stone-400'}`}>
                    {chat.lastMsg}
                  </p>
                  {chat.unread > 0 ? (
                    <span className="w-5 h-5 rounded-full bg-pink-600 text-[10px] font-black flex items-center justify-center text-white">
                      {chat.unread}
                    </span>
                  ) : (
                    <CheckCheck className="w-3 h-3 text-pink-500" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
