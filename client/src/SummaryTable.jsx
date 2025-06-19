import React from 'react';

const SummaryTable = ({ questions, responses, title = 'Summary of All Responses' }) => (
  <div style={{ margin: '32px 0', padding: 24, background: '#e3f2fd', borderRadius: 8 }}>
    <h2>{title}</h2>
    <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Question</th>
          <th style={{ border: '1px solid #ccc', padding: 8, textAlign: 'left' }}>Response</th>
        </tr>
      </thead>
      <tbody>
        {questions.map((q, idx) => (
          <tr key={idx}>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{q}</td>
            <td style={{ border: '1px solid #ccc', padding: 8 }}>{responses[q]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default SummaryTable; 