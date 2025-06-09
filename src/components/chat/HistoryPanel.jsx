import React from 'react';

const HistoryPanel = ({ isOpen, onClose, history, onHistoryItemClick, onClearHistory }) => {
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Create a reversed copy of the history array
  const reversedHistory = [...history].reverse();

  return (
    <div className={`history-panel ${isOpen ? 'open' : ''}`}>
      <div className="history-panel-header">
        <h3>Chat History</h3>
        <button 
          className="history-close-btn" 
          onClick={onClose}
        >
          ×
        </button>
      </div>
      
      <div className="history-panel-content">
        {history.length === 0 ? (
          <div className="no-history-message">
            No chat history available
          </div>
        ) : (
          reversedHistory.map((item, index) => (
            <div 
              key={index} 
              className="history-item"
              onClick={() => onHistoryItemClick(item.question)}
            >
              <div className="history-question">
                {item.question}
              </div>
              <div className="history-answer">
                {truncateText(item.answer)}
              </div>
              <div className="history-timestamp">
                {item.displayTime}
              </div>
            </div>
          ))
        )}
      </div>

      {history.length > 0 && (
        <div className="history-panel-footer">
          <button 
            className="clear-history-btn" 
            onClick={onClearHistory}
          >
            Clear History
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel; 