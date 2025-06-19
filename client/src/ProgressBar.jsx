import React from 'react';

const ProgressBar = ({ current, total, questions = [], responses = {} }) => {
  // If questions and responses are provided, use them for segment coloring
  const showSegments = questions.length > 0;
  return (
    <div style={{ margin: '16px 0', width: '100%', maxWidth: 640 }}>
      {showSegments ? (
        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
          {questions.map((q, idx) => {
            // Mark as answered if a response exists (including for the last question)
            {/*background: answered
                    ? (isCurrent ? '#1976d2' : '#4caf50')
                    : (isCurrent ? '#1976d2' : '#e0e0e0'),
                  */}
            const responseValue = responses[q];
            const answered = typeof responseValue === 'string' && responseValue.trim().length > 0;
            const isCurrent = idx === current;
            const isLast = idx === questions.length;
            console.log(isCurrent,'--isCurrent--',current,'----KASHIF current--responses--',responses,'--questions---',questions)
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: 16,
                  borderRadius: 8,
                  background: answered
                  ? (isCurrent ? '#1976d2' : '#1976d2')
                  : (isCurrent ? '#1976d2' : '#e0e0e0'),
                  
                 
                  border: isCurrent ? '2px solid #333' : '1px solid #999999',
                  transition: 'background 0.3s',
                  marginRight: idx < questions.length - 1 ? 4 : 0
                }}
                title={q}
              />
            );
          })}
        </div>
      ) : (
        <div style={{
          background: '#e0e0e0',
          borderRadius: 8,
          height: 16,
          width: '100%',
          overflow: 'hidden',
          marginBottom: 4
        }}>
          <div style={{
            width: `${total > 0 ? ((current + 1) / total) * 100 : 0}%`,
            background: '#1976d2',
            height: '100%',
            transition: 'width 0.3s',
          }} />
        </div>
      )}
      <div style={{ fontSize: 14, color: '#333', textAlign: 'right' }}>
        Question {current + 1} of {total}
      </div>
    </div>
  );
};

export default ProgressBar; 