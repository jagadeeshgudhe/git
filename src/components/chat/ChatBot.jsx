import React, { useState, useRef, useEffect } from "react";
import { hrPoliciesData } from "../../data/hrPolicies";
import { useChat } from "../../context/ChatContext";
import Suggestions from "./Suggestions";
import HistoryPanel from "./HistoryPanel";
import "../../styles/chat/ChatBot.css";

const API_URL = '/api/QA';  // This will be proxied by Vite
const API_KEY = 'AIzaSyCR7AMuBCl2zj8wwX_xGxVGm6pWkA2vha';

const INITIAL_MESSAGE = {
  text: "👋 Hi! I'm your HR Assistant. How can I help you today?",
  sender: "bot",
  timestamp: new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }),
  isNew: true,
  sources: [],
  relatedQuestions: [
  ]
};

const VirtualAssistanceButton = ({ onClick }) => {
  return (
    <button className="virtual-assistance-btn" onClick={onClick} title="AI Assistant">
      <span className="icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      </span>
      Virtual Assistant
    </button>
  );
};

const ChatBot = ({ onClose, onMinimize }) => {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [historicalData, setHistoricalData] = useState(() => {
    const savedHistoricalData = localStorage.getItem('historicalChatData');
    return savedHistoricalData ? JSON.parse(savedHistoricalData) : [];
  });

  const scrollToBottom = (force = false) => {
    if (shouldAutoScroll || force) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle manual scrolling
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
    setShouldAutoScroll(isAtBottom);
    setShowScrollButton(!isAtBottom);
  };

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev =>
        prev.map(msg => ({ ...msg, isNew: false }))
      );
    }, 2000);

    return () => clearTimeout(timer);
  }, [messages]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Function to check if a chat is from a previous day
  const isFromPreviousDay = (timestamp) => {
    const today = new Date();
    const chatDate = new Date(timestamp);
    return chatDate.getDate() !== today.getDate() ||
           chatDate.getMonth() !== today.getMonth() ||
           chatDate.getFullYear() !== today.getFullYear();
  };

  // Move current day's chats to historical data at midnight
  useEffect(() => {
    const checkDayChange = () => {
      const currentHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
      const currentHistorical = JSON.parse(localStorage.getItem('historicalChatData') || '[]');
      
      // Filter out chats from previous days
      const previousDayChats = currentHistory.filter(chat => isFromPreviousDay(chat.timestamp));
      const todayChats = currentHistory.filter(chat => !isFromPreviousDay(chat.timestamp));
      
      if (previousDayChats.length > 0) {
        // Add previous day's chats to historical data
        const updatedHistorical = [...currentHistorical, ...previousDayChats];
        localStorage.setItem('historicalChatData', JSON.stringify(updatedHistorical));
        setHistoricalData(updatedHistorical);
        
        // Update current history to only include today's chats
        localStorage.setItem('chatHistory', JSON.stringify(todayChats));
        setChatHistory(todayChats);
      }
    };

    // Check on component mount
    checkDayChange();

    // Set up interval to check at midnight
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timeUntilMidnight = tomorrow - now;

    const midnightTimeout = setTimeout(() => {
      checkDayChange();
      // Set up daily interval after first midnight
      const dailyInterval = setInterval(checkDayChange, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  // Add to history with timestamp
  const addToHistory = (question, answer) => {
    const historyItem = {
      question,
      answer,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric'
      })
    };
    setChatHistory(prev => [...prev, historyItem]);
  };

  const formatResponse = (data) => {
    const response = {
      text: data.answer,
      sources: [],
      suggestions: []
    };

    // Find relevant policy documents based on the category
    const category = determineCategory(data.answer);
    const relevantPolicy = hrPoliciesData.policies.find(policy => 
      policy.name.toLowerCase() === category.toLowerCase()
    );

    // Add source if found
    if (relevantPolicy) {
      response.sources = [{
        name: relevantPolicy.name,
        url: relevantPolicy.documentUrl
      }];
    }

    return response;
  };

  const determineCategory = (text) => {
    const lowerText = text.toLowerCase();
    
    // Create a scoring system for each category
    const scores = {
      'Dress Code and Hygiene': 0,
      'Leave Management': 0,
      'Captive Allowance': 0,
      'Non-Standard Working Hours': 0,
      'Notice Period and Recovery': 0,
      'Disciplinary Actions': 0
    };

    // Keywords for each category
    const categoryKeywords = {
      'Dress Code and Hygiene': ['dress code', 'attire', 'clothing', 'wear', 'formal', 'casual', 'hygiene', 'footwear', 'shoes', 'appearance', 'grooming', 'outfit', 'suits', 'shirt', 'trousers', 'saree', 'uniform'],
      'Leave Management': ['leave', 'vacation', 'time off', 'sick', 'maternity', 'paternity', 'absence', 'holiday', 'sabbatical', 'emergency leave'],
      'Captive Allowance': ['captive', 'allowance', 'compensation', 'benefits', 'payment', 'claim', 'reimbursement'],
      'Non-Standard Working Hours': ['working hours', 'overtime', 'weekend', 'shift', 'late night', 'flexible', 'schedule', 'timing'],
      'Notice Period and Recovery': ['notice', 'recovery', 'resignation', 'termination', 'exit', 'leaving', 'last day'],
      'Disciplinary Actions': ['disciplinary', 'violation', 'warning', 'conduct', 'behavior', 'action', 'misconduct', 'penalty']
    };

    // Score each category based on keyword matches
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          scores[category] += 1;
        }
      });
    });

    // Find category with highest score
    const maxScore = Math.max(...Object.values(scores));
    const matchedCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];

    // Return matched category if score > 0, otherwise return 'General'
    return maxScore > 0 ? matchedCategory : 'General';
  };

  const formatMessageContent = (text) => {
    // Split the text and document URL if present
    const urlMatch = text.match(/Document URL: (https?:\/\/[^\s]+)/);
    const documentUrl = urlMatch ? urlMatch[1] : null;
    const messageText = urlMatch ? text.replace(/Document URL: https?:\/\/[^\s]+/, '').trim() : text;

    return { messageText, documentUrl };
  };

  const formatStructuredResponse = (text, query) => {
    // Add the response template structure
    const responseTemplate = `${text}

## Related Questions
- What are the recent updates to HR policies?
- How do these policies affect remote workers?
- What is the policy implementation timeline?`;

    // Convert the text to HTML format with proper structure
    const formattedText = responseTemplate
      .split('\n')
      .map(line => {
        if (line.startsWith('# ')) {
          return `<h1 class="response-main-heading">${line.substring(2)}</h1>`;
        } else if (line.startsWith('## ')) {
          return `<h2 class="response-subheading">${line.substring(3)}</h2>`;
        } else if (line.startsWith('### ')) {
          return `<h3 class="response-subheading-2">${line.substring(4)}</h3>`;
        } else if (line.startsWith('- ')) {
          return `<li class="response-list-item">${line.substring(2)}</li>`;
        } else if (line.startsWith('* ')) {
          return `<li class="response-list-item">${line.substring(2)}</li>`;
        } else if (line.trim().startsWith('|')) {
          // Table row handling
          const cells = line.trim().split('|').filter(cell => cell.trim());
          const isHeader = cells.every(cell => cell.includes('---'));
          if (isHeader) {
            return ''; // Skip separator row
          }
          const isFirstRow = !cells.some(cell => cell.includes('---'));
          if (isFirstRow) {
            return `<tr class="table-header">${cells.map(cell => `<th>${cell.trim()}</th>`).join('')}</tr>`;
          }
          return `<tr>${cells.map(cell => `<td>${cell.trim()}</td>`).join('')}</tr>`;
        } else if (line.trim() === '') {
          return '</ul><br/>'; // Close list if empty line
        } else {
          return `<p class="response-paragraph">${line}</p>`;
        }
      })
      .join('\n');

    // Wrap lists properly
    const wrappedText = formattedText
      .replace(/<li>/g, '<ul class="response-list"><li>')
      .replace(/<\/li>\s*<br\/>/g, '</li></ul>')
      .replace(/<\/li>\s*<p>/g, '</li></ul><p>')
      .replace(/<\/p>\s*<li>/g, '</p><ul class="response-list"><li>');

    // Wrap tables properly
    const finalText = wrappedText
      .replace(/<tr class="table-header">/g, '<table class="response-table"><thead><tr>')
      .replace(/<\/tr>\s*<tr>/g, '</tr></thead><tbody><tr>')
      .replace(/<\/tr>\s*<p>/g, '</tr></tbody></table><p>')
      .replace(/<\/tr>\s*<h/g, '</tr></tbody></table><h');

    return `<div class="structured-response">
      ${finalText}
    </div>`;
  };

  const handleSendMessage = async (e, messageText = null) => {
    e?.preventDefault();
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    // Add user message
    const userMessage = {
      text: textToSend,
      sender: "user",
      timestamp: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      isNew: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsBotTyping(true);
    setIsError(false);

    try {
      // First, try to get a CORS pre-flight response
      const preflightResponse = await fetch(API_URL, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type, x-api-key',
          'Origin': window.location.origin
        }
      });

      // Now make the actual request
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          question: textToSend,
          region: "IND-HR Policies"
        })
      });

      if (!response.ok) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`API error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Debug log

      if (!data || !data.answer) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response from server');
      }

      const formattedResponse = formatResponse(data);
      const structuredText = formatStructuredResponse(formattedResponse.text, textToSend);

      const botMessage = {
        text: structuredText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        sources: formattedResponse.sources,
        relatedQuestions: formattedResponse.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
      addToHistory(textToSend, structuredText);
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setIsError(true);
      
      let errorMessage = "I apologize, but I'm having trouble connecting to the server. ";
      
      if (error.message.includes('Failed to fetch')) {
        errorMessage += "Please check your internet connection and ensure you're not blocking any required domains.";
      } else if (error.message.includes('NetworkError')) {
        errorMessage += "There seems to be a network connectivity issue. Please check your connection.";
      } else if (error.message.includes('401')) {
        errorMessage += "There was an authentication error. Please contact support.";
      } else if (error.message.includes('403')) {
        errorMessage += "Access to the service is forbidden. Please verify your API key.";
      } else if (error.message.includes('429')) {
        errorMessage += "Too many requests. Please try again in a few minutes.";
      } else if (error.message.includes('500')) {
        errorMessage += "The server encountered an error. Please try again later.";
      } else {
        errorMessage += `Error: ${error.message}. Please try again later or contact support if the issue persists.`;
      }

      const botErrorMessage = {
        text: errorMessage,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        isError: true,
        sources: [],
        relatedQuestions: [
          "Would you like to try asking your question again?",
          "Can I help you with something else?"
        ]
      };
      
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    console.log('Suggestion clicked:', suggestion); // Debug log
    handleSendMessage(null, suggestion);
  };

  const handleEditMessage = (index) => {
    setEditingMessageId(index);
    setEditText(messages[index].text);
  };

  const handleSaveEdit = async (index) => {
    if (!editText.trim()) return;

    // Update the edited message
    const updatedMessages = [...messages];
    updatedMessages[index] = {
      ...updatedMessages[index],
      text: editText.trim(),
      isEdited: true
    };

    // Remove all messages after the edited message
    const messagesBeforeEdit = updatedMessages.slice(0, index + 1);
    setMessages(messagesBeforeEdit);
    setEditingMessageId(null);
    setEditText("");
    setIsBotTyping(true);

    try {
      // Add a minimum delay to show typing indicator
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify({
          question: editText.trim(),
          region: "IND-HR Policies"
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.answer) throw new Error('No answer in response');

      const formattedResponse = formatResponse(data);
      
      // Add another small delay before showing bot response
      await new Promise(resolve => setTimeout(resolve, 500));

      const botMessage = {
        text: formattedResponse.text,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        sources: formattedResponse.sources,
        relatedQuestions: formattedResponse.relatedQuestions
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        text: "I apologize, but I'm having trouble processing your edited message.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        isNew: true,
        isError: true,
        sources: [],
        relatedQuestions: [
          "Could you try rephrasing your question?",
          "Would you like to ask something else?"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
      scrollToBottom(true);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const handleClearChat = () => {
    setShowClearModal(true);
  };

  const handleClearHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
    setIsHistoryOpen(false);
  };

  const confirmClearChat = () => {
    setMessages([INITIAL_MESSAGE]); // Reset messages to initial state
    setShowClearModal(false);
  };

  const cancelClearChat = () => {
    setShowClearModal(false);
  };

  // Handle history item click
  const handleHistoryItemClick = (question) => {
    handleSendMessage(null, question);
    setIsHistoryOpen(false);
  };

  // Add feedback handling
  const handleFeedback = async (messageId, isPositive) => {
    try {
      // Update the message with feedback
      setMessages(prev => prev.map((msg, idx) => 
        idx === messageId 
          ? { ...msg, feedback: isPositive, feedbackSubmitted: true }
          : msg
      ));

      // Send feedback to backend
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          feedback: isPositive,
          question: messages[messageId - 1]?.text, // User's question
          answer: messages[messageId].text, // Bot's answer
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <>
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div className="header-left">
            <div className="header-content">
              <img
                src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                alt="HR Assistant"
                className="header-avatar"
              />
              <div className="header-title-status">
                <span className="header-title">HR Assistant</span>
                <div className="header-status">
                  <span className="status-dot"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>
          <div className="header-controls">
            <button
              className="control-btn history"
              onClick={() => setIsHistoryOpen(true)}
              title="Chat History"
              disabled={chatHistory.length === 0}
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
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
              </svg>
            </button>
            <button 
              className="control-btn clear" 
              onClick={handleClearChat}
              title="Clear current chat"
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
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </button>
            {window.location.pathname === '/' && onMinimize && (
              <button className="control-btn minimize" onClick={onMinimize} title="Minimize">
                <span>─</span>
              </button>
            )}
            {window.location.pathname === '/' && onClose && (
              <button className="control-btn close" onClick={onClose} title="Close">
                <span>×</span>
              </button>
            )}
          </div>
        </div>

        {/* Clear Chat Confirmation Modal */}
        {showClearModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Clear Current Chat</h3>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to clear the current chat? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="modal-btn cancel" onClick={cancelClearChat}>
                  Cancel
                </button>
                <button className="modal-btn confirm" onClick={confirmClearChat}>
                  Clear Chat
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          className={`chatbot-messages ${shouldAutoScroll ? 'force-scroll' : ''}`}
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender} ${message.isNew ? 'new' : ''} ${message.isError ? 'error' : ''}`}
            >
              <div className={`message-icon ${message.sender === 'bot' && message.isNew ? 'speaking' : ''}`}>
                {message.sender === "bot" ? (
                  <div className="bot-avatar-container">
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                      alt="Bot avatar"
                      className="icon"
                    />
                    {message.isNew && (
                      <div className="sound-waves">
                        <div className="wave wave1"></div>
                        <div className="wave wave2"></div>
                        <div className="wave wave3"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <circle cx="12" cy="7" r="4" />
                    <path d="M5.5 21h13a2 2 0 002-2v-1a6 6 0 00-6-6h-5a6 6 0 00-6 6v1a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
                {editingMessageId === index && message.sender === 'user' ? (
                  <div className="edit-message">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                    />
                    <div className="edit-actions">
                      <button onClick={() => handleSaveEdit(index)} className="save-btn">
                        Save
                      </button>
                      <button onClick={handleCancelEdit} className="cancel-btn">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="message-text">
                      <div dangerouslySetInnerHTML={{ __html: message.text }} />
                      {message.isEdited && <span className="edited-tag">(edited)</span>}
                    </div>
                    {message.sender === 'user' && (
                      <button 
                        onClick={() => handleEditMessage(index)} 
                        className="edit-btn"
                        title="Edit message"
                      >
                        ✎
                      </button>
                    )}
                  </>
                )}
                {message.sender === 'bot' && !message.isError && (
                  <div className="message-details">
                    {message.documentUrl && (
                      <div className="document-url">
                        Document URL: <a href={message.documentUrl} target="_blank" rel="noopener noreferrer">{message.documentUrl}</a>
                      </div>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="sources">
                        <h4>Related Policies:</h4>
                        <ul>
                          {message.sources.map((source, idx) => (
                            <li key={idx}>
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="policy-link"
                              >
                                {source.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                      <div className="related-questions">
                        <h4>You might also want to ask:</h4>
                        <ul>
                          {message.relatedQuestions.map((question, idx) => (
                            <li 
                              key={idx}
                              onClick={() => {
                                setInputText(question);
                                document.querySelector('.chatbot-input input').focus();
                              }}
                              className="related-question"
                            >
                              {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Suggestions
                      category={message.category}
                      suggestions={message.suggestions}
                      onSuggestionClick={(suggestion) => handleSendMessage(null, suggestion)}
                    />
                  </div>
                )}
                {message.sender === 'bot' && !message.isError && (
                  <div className="message-feedback">
                    {!message.feedbackSubmitted ? (
                      <>
                        <button
                          className="feedback-btn"
                          onClick={() => handleFeedback(index, true)}
                          title="Helpful"
                        >
                          👍
                        </button>
                        <button
                          className="feedback-btn"
                          onClick={() => handleFeedback(index, false)}
                          title="Not helpful"
                        >
                          👎
                        </button>
                      </>
                    ) : (
                      <span className="feedback-submitted">
                        {message.feedback ? '👍 Thanks for your feedback!' : '👎 Thanks for your feedback!'}
                      </span>
                    )}
                  </div>
                )}
                <div className="message-time">{message.timestamp}</div>
              </div>
            </div>
          ))}
          {isBotTyping && (
            <div className="message bot typing">
              <div className="message-icon">
                <div className="bot-avatar-container">
                  <img
                    src="https://cdn-icons-png.flaticon.com/128/16683/16683439.png"
                    alt="Bot avatar"
                    className="icon"
                  />
                </div>
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="message-anchor" />
        </div>

        {showScrollButton && (
          <button 
            className="scroll-to-bottom visible"
            onClick={() => scrollToBottom(true)}
            title="Scroll to bottom"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 15.5l-4.5-4.5h9l-4.5 4.5z" />
            </svg>
          </button>
        )}

        <form className="chatbot-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
            spellCheck="false"
            maxLength={300}
            disabled={isBotTyping}
          />
          <button type="submit" disabled={!inputText.trim() || isBotTyping} aria-label="Send">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
      
      {/* Virtual Assistance Button */}
      <VirtualAssistanceButton onClick={() => {/* Add your click handler */}} />

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={chatHistory}
        onHistoryItemClick={handleHistoryItemClick}
        onClearHistory={handleClearHistory}
      />
    </>
  );
};

export default ChatBot;
