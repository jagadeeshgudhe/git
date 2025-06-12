import React, { useState } from 'react';

const HistoryPanel = ({ isOpen, onClose, history, onHistoryItemClick, onClearHistory }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    // Remove any remaining HTML entities
    text = text.replace(/&[^;]+;/g, '');
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatAnswer = (text) => {
    if (!text) return '';
    // Split by periods that are followed by a space or end of string
    const sentences = text.split(/\.\s+|\.$/).filter(s => s.trim());
    return sentences.map(sentence => sentence.trim() + '.').join('\n• ');
  };

  const toggleExpand = (index, type) => {
    setExpandedItems(prev => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`]
    }));
  };

  // Create a reversed copy of the history array to show newest first
  const reversedHistory = [...(history || [])].reverse();

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      onClearHistory();
      onClose();
    }
  };

  return (
    <div className={`history-panel ${isOpen ? 'open' : ''}`}>
      <div className="history-panel-header">
        <h3>Chat History</h3>
        <button 
          className="history-close-btn" 
          onClick={onClose}
          aria-label="Close history"
        >
          ×
        </button>
      </div>
      
      <div className="history-panel-content">
        {!reversedHistory || reversedHistory.length === 0 ? (
          <div className="no-history-message">
            No chat history available
          </div>
        ) : (
          reversedHistory.map((entry, index) => (
            <div 
              key={index} 
              className="history-item"
            >
              <div className="history-timestamp">
                {formatTimestamp(entry.timestamp)}
              </div>
              <div className="history-question">
                <div className="history-text">
                  <strong>Q:</strong> <span className="query-text">{expandedItems[`${index}-question`] 
                    ? entry.userMessage?.text 
                    : truncateText(entry.userMessage?.text || '', 100)}</span>
                </div>
                {(entry.userMessage?.text || '').length > 100 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpand(index, 'question')}
                  >
                    {expandedItems[`${index}-question`] ? 'Show Less' : 'Show More'}
                  </button>
                )}
                <button 
                  className="resend-btn"
                  onClick={() => onHistoryItemClick(entry.userMessage?.text || '')}
                  title="Resend this question"
                >
                  ↺ Ask Again
                </button>
              </div>
              <div className="history-answer">
                <div className="history-text">
                  <strong>A:</strong> 
                  <div className="answer-text">
                    • {expandedItems[`${index}-answer`] 
                      ? formatAnswer(entry.botMessage?.text)
                      : truncateText(entry.botMessage?.text || '', 200)}
                  </div>
                </div>
                {(entry.botMessage?.text || '').length > 200 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpand(index, 'answer')}
                  >
                    {expandedItems[`${index}-answer`] ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {reversedHistory && reversedHistory.length > 0 && (
        <div className="history-panel-footer">
          <button 
            className="clear-history-btn" 
            onClick={handleClearHistory}
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel; 