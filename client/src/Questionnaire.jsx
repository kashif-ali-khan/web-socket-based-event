import React, { useState, useEffect } from 'react';

const Questionnaire = ({ questions, onSendQuestion, onIndexChange, onSubmitResponse }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (onIndexChange) onIndexChange(currentIndex);
    // eslint-disable-next-line
  }, [currentIndex]);

  useEffect(() => {
    if (onIndexChange) onIndexChange(0);
    // eslint-disable-next-line
  }, []);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      onSendQuestion(questions[nextIndex]);
      setResponse(''); // Clear response when moving to next question
    }
  };

  const handleSendCurrent = () => {
    onSendQuestion(questions[currentIndex]);
  };

  const handleSubmitResponse = () => {
    if (response.trim()) {
      onSubmitResponse(questions[currentIndex], response.trim());
      // Don't clear response here as agent might need to make corrections
      // For last question, keep response in state so progress bar marks it green
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      if (onIndexChange) onIndexChange(prevIndex);
    }
  };

  return (
    <div style={{ margin: '24px 0' }}>
      <h3>Questionnaire</h3>
      <div style={{ marginBottom: 12 }}>
        <strong>Q{currentIndex + 1}:</strong> {questions[currentIndex]}
      </div>
      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type customer's response here..."
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '8px',
            fontSize: '16px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <button 
          onClick={handleSubmitResponse} 
          style={{ 
            marginRight: 8,
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          disabled={!response.trim()}
        >
          Submit Response
        </button>
        <button onClick={handlePrevious} disabled={currentIndex === 0} style={{ marginRight: 8 }}>Previous</button>
       {/*} <button onClick={handleSendCurrent} style={{ marginRight: 8 }}>Send to Customer</button>{*/}
        <button onClick={handleNext} disabled={currentIndex >= questions.length - 1}>Next</button>
      </div>
    </div>
  );
};

export default Questionnaire; 