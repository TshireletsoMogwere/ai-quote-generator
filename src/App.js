import React, { useEffect, useState } from 'react';
import { Clipboard, RefreshCw, Share2, Heart, Trash2, Edit, Plus, X, Facebook, Instagram, Send } from 'lucide-react';

// Fallback quotes in case API fails
const fallbackQuotes = [
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "I pursued a career in psychology with the intention of healing others only to realize that I, too, need healing", author: "Tshireletso Mogwere" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If life were predictable it would cease to be life, and be without flavor.", author: "Eleanor Roosevelt" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success.", author: "James Cameron" },
  { text: "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart.", author: "Helen Keller" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" }
];

// Add CSS animation classes
const styleTag = document.createElement('style');
styleTag.innerHTML = `
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  .animation-delay-6000 {
    animation-delay: 6s;
  }
`;
document.head.appendChild(styleTag);

const API_KEY = 'kLWdLIHqJdJOu4+p1wszkg==LYKUR7hODaZnPlPX'; 

function App() {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [newQuote, setNewQuote] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [showShareOptions, setShowShareOptions] = useState(false);

  // Load favorites from localStorage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  const getRandomFallbackQuote = () => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    return fallbackQuotes[randomIndex];
  };
  
  const getQuote = async () => {
    setLoading(true);
    setApiError(false);
    
    try {
      const res = await fetch('https://type.fit/api/quotes');
      
      if (!res.ok) throw new Error('API request failed');
      
      const data = await res.json();
      
      if (data && data.length > 0) {
        const randomQuote = data[Math.floor(Math.random() * data.length)];
        setQuote(randomQuote.text);
        setAuthor(randomQuote.author || 'Unknown');
      } else {
        // If no quotes in response, use fallback
        const fallback = getRandomFallbackQuote();
        setQuote(fallback.text);
        setAuthor(fallback.author);
        setApiError(true);
      }
    } catch (error) {
      console.error('Error fetching quote:', error);
      // Use fallback quotes on error
      const fallback = getRandomFallbackQuote();
      setQuote(fallback.text);
      setAuthor(fallback.author);
      setApiError(true);
    } finally {
      setLoading(false);
      setCopied(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`"${quote}" - ${author}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add current quote to favorites
  const addToFavorites = () => {
    const now = new Date();
    const newFavorite = {
      text: quote,
      author: author,
      timestamp: now.toISOString(),
      id: Date.now().toString()
    };
    
    setFavorites(prev => [newFavorite, ...prev]);
  };

  // Remove a quote from favorites
  const removeFromFavorites = (id) => {
    setFavorites(prev => prev.filter(fav => fav.id !== id));
  };

  // Check if current quote is in favorites
  const isInFavorites = () => {
    return favorites.some(fav => fav.text === quote && fav.author === author);
  };

  // Create and publish a new custom quote
  const createQuote = () => {
    if (newQuote.trim() && newAuthor.trim()) {
      const now = new Date();
      const customQuote = {
        text: newQuote.trim(),
        author: newAuthor.trim(),
        timestamp: now.toISOString(),
        id: Date.now().toString(),
        isCustom: true
      };
      
      // Add to favorites and set as current quote
      setFavorites(prev => [customQuote, ...prev]);
      setQuote(customQuote.text);
      setAuthor(customQuote.author);
      
      // Reset form and close modal
      setNewQuote('');
      setNewAuthor('');
      setShowCreateQuote(false);
    }
  };

  // Format timestamp to readable date and time
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
  };

  // Share to specific platform
  const shareTo = (platform) => {
    const quoteText = `"${quote}" - ${author}`;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(quoteText)}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(quoteText)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(quoteText);
        alert('Quote copied! Open Instagram and paste in your story or post.');
        break;
      case 'tiktok':
        navigator.clipboard.writeText(quoteText);
        alert('Quote copied! Open TikTok and paste in your post or video description.');
        break;
      case 'slack':
        window.open(`https://slack.com/app_redirect?app=A025DR9S7CF&tab=home&text=${encodeURIComponent(quoteText)}`, '_blank');
        break;
      default:
        navigator.clipboard.writeText(quoteText);
    }
    
    setShowShareOptions(false);
  };

  useEffect(() => {
    getQuote();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-8 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-sm"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10" style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }}>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm bg-white/90">
          {/* Header */}
          <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-800">Daily Inspiration</h1>
              <p className="text-indigo-500 text-sm">Wisdom to brighten your day</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setShowFavorites(false);
                  setShowCreateQuote(true);
                }}
                className="text-indigo-600 hover:bg-indigo-100 p-2 rounded-full"
                aria-label="Create quote"
              >
                <Plus className="h-5 w-5" />
              </button>
              <button 
                onClick={() => {
                  setShowFavorites(!showFavorites);
                  setShowCreateQuote(false);
                }}
                className={`p-2 rounded-full ${showFavorites ? 'bg-indigo-100 text-indigo-600' : 'text-indigo-600 hover:bg-indigo-100'}`}
                aria-label="Show favorites"
              >
                <Heart className={`h-5 w-5 ${favorites.length > 0 ? 'fill-indigo-200' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Content */}
          {showFavorites ? (
            <div className="p-6 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-semibold text-indigo-800 mb-4">Your Favorite Quotes</h2>
              {favorites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">You haven't saved any favorites yet.</p>
              ) : (
                <div className="space-y-6">
                  {favorites.map((fav) => (
                    <div key={fav.id} className="bg-indigo-50 p-4 rounded-lg relative">
                      <p className="text-gray-800 italic mb-2">"{fav.text}"</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-gray-600 font-medium">― {fav.author}</p>
                          <p className="text-gray-400 text-xs mt-1">Saved on {formatTimestamp(fav.timestamp)}</p>
                          {fav.isCustom && (
                            <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full mt-1 inline-block">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setQuote(fav.text);
                              setAuthor(fav.author);
                              setShowFavorites(false);
                            }}
                            className="p-1 text-indigo-600 hover:bg-indigo-100 rounded"
                            aria-label="Use this quote"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromFavorites(fav.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            aria-label="Remove from favorites"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : showCreateQuote ? (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-indigo-800 mb-4">Create Your Own Quote</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="quote-text" className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Text
                  </label>
                  <textarea
                    id="quote-text"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your quote here..."
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="quote-author" className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    id="quote-author"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name or the author's name"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={createQuote}
                    disabled={!newQuote.trim() || !newAuthor.trim()}
                    className={`px-4 py-2 rounded-lg text-white transition-colors ${
                      newQuote.trim() && newAuthor.trim()
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Publish Quote
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 relative">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <blockquote className="text-xl text-gray-800 leading-relaxed relative italic">
                    <div className="text-indigo-300 text-6xl absolute -top-4 -left-2">"</div>
                    <p className="relative z-10 pt-4 pl-4">{quote}</p>
                  </blockquote>
                  
                  <div className="flex items-center justify-end">
                    <p className="text-gray-600 font-medium">― {author}</p>
                  </div>
                  
                  {apiError && (
                    <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                      Using offline quotes due to connection issues. Try again later.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
            <button
              onClick={isInFavorites() ? null : addToFavorites}
              className={`flex items-center space-x-1 p-2 rounded-lg transition-colors ${
                isInFavorites() ? 'text-red-500' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
              aria-label={isInFavorites() ? "Already in favorites" : "Add to favorites"}
              disabled={isInFavorites() || showFavorites || showCreateQuote}
            >
              <Heart className={`h-5 w-5 ${isInFavorites() ? 'fill-current' : ''}`} />
            </button>

            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                aria-label="Copy to clipboard"
                disabled={showFavorites || showCreateQuote}
              >
                <Clipboard className="h-4 w-4" />
                <span className="text-sm font-medium">{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  aria-label="Share quote"
                  disabled={showFavorites || showCreateQuote}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>
                
                {/* Share options dropdown */}
                {showShareOptions && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg p-2 z-10">
                    <button
                      onClick={() => shareTo('facebook')}
                      className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">f</div>
                      <span>Facebook</span>
                    </button>
                    <button
                      onClick={() => shareTo('instagram')}
                      className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 rounded-full flex items-center justify-center text-white">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <span>Instagram</span>
                    </button>
                    <button
                      onClick={() => shareTo('tiktok')}
                      className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-white">
                        <span className="text-xs font-bold">TT</span>
                      </div>
                      <span>TikTok</span>
                    </button>
                    <button
                      onClick={() => shareTo('whatsapp')}
                      className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <Send className="h-3 w-3" />
                      </div>
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => shareTo('slack')}
                      className="flex items-center space-x-2 w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white">
                        <span className="text-xs font-bold">S</span>
                      </div>
                      <span>Slack</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  getQuote();
                  setShowFavorites(false);
                  setShowCreateQuote(false);
                }}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                aria-label="Get new quote"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">New Quote</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Attribution */}
        <div className="mt-4 text-center text-indigo-200 text-sm">
          <p>Created with React & Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}

export default App;