import React, { useState } from 'react';
import { useWebSocket } from './useWebSocket';
import Questionnaire from './Questionnaire';
import ProgressBar from './ProgressBar';
import SummaryTable from './SummaryTable';

const AgentApp = () => {
  const [logs, setLogs] = useState([]);
  const [customerImages, setCustomerImages] = useState({});
  const [previewImage, setPreviewImage] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startQuestion, setStartQuestion] = useState(false);
  const [responses, setResponses] = useState({});

  // Example questions
  const questions = [
    'What is your full name?',
    'What is your date of birth?',
    'What is your address?',
    'Please show your ID to the camera.',
  ];

  const sendMessage = useWebSocket('agent1', (msg) => {
    if (msg.type === 'face_captured' || msg.type === 'id_captured') {
      console.log(msg)
      setLogs((prev) => [...prev, `Image captured: ${msg.type}`]);
      setCustomerImages((prev) => ({
        ...prev,
        [msg.type]: msg.payload.imageData || null
      }));
    }
    if (msg.type === 'response') {
      setLogs((prev) => [...prev, `Response to "${msg.payload.question}": ${msg.payload.response}`]);
    }
  });

  // Function to send question to customer
  const sendQuestionToCustomer = (question) => {
    sendMessage('question', 'customer1', { question });
    setLogs((prev) => [...prev, `Sent question: ${question}`]);
  };

  // Function to submit response to customer
  const submitResponseToCustomer = (question, response) => {
    sendMessage('submit_response', 'customer1', { question, response });
    setLogs((prev) => [...prev, `Submitted response for "${question}": ${response}`]);
    setResponses(prev => ({
      ...prev,
      [question]: response
    }));
  };

  const triggerFaceCapture = () => {
    sendMessage('photo_ready', 'customer1');
    setTimeout(() => {
      sendMessage('photo_capture', 'customer1');
    }, 2000);
  };

  const triggerIDCapture = () => {
    sendMessage('id_ready', 'customer1');
    setTimeout(() => {
      sendMessage('id_capture', 'customer1');
    }, 2000);
  };

  const initiateQuestion = ()=>{
    sendMessage('question_started', 'customer1');
    setStartQuestion(true);
    sendQuestionToCustomer(questions[0])
  }

  // Function to check if all questions have responses
  const allAnswered = questions.every(q => responses[q]);

  // Handler to send the current question to the customer when index changes
  const handleIndexChange = (newIndex) => {
    sendQuestionToCustomer(questions[newIndex]);
    setCurrentQuestionIndex(newIndex);
  };

  return (
    <div>
      <h2>Agent App</h2>
      { startQuestion && (<> 
        <ProgressBar current={currentQuestionIndex} total={questions.length} questions={questions} responses={responses} />
        <Questionnaire 
          questions={questions} 
          onSendQuestion={sendQuestionToCustomer} 
          onIndexChange={handleIndexChange}
          onSubmitResponse={submitResponseToCustomer}
        />
      </>)}
     
      <button onClick={initiateQuestion}>Begin Questionaries</button>
      <button onClick={triggerFaceCapture}>Capture Face</button>
      <button onClick={triggerIDCapture}>Capture ID</button>
      
      {/* Display responses */}
      <div style={{ margin: '24px 0' }}>
        <h3>Submitted Responses</h3>
        {Object.entries(responses).map(([question, response]) => (
          <div key={question} style={{ marginBottom: 8, padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
            <div><strong>Q:</strong> {question}</div>
            <div><strong>A:</strong> {response}</div>
          </div>
        ))}
      </div>

      {/* Show summary table if all questions are answered 
      {allAnswered && (
        <SummaryTable questions={questions} responses={responses} />
      )}
*/}
      <div>{logs.map((l, i) => <div key={i}>{l}</div>)}</div>
      {Object.entries(customerImages).map(([type, img]) =>
        img ? (
          <div key={type} style={{ marginBottom: 16 }}>
            <div>{type.replace('_', ' ').toUpperCase()}</div>
            <img src={img} alt={type} width={160} style={{ marginRight: 8 }} />
            <button onClick={() => setPreviewImage({ type, img })}>Preview</button>
          </div>
        ) : null
      )}
      {previewImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
          onClick={() => setPreviewImage(null)}
        >
          <div style={{ position: 'relative', background: '#fff', padding: 24, borderRadius: 8 }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 8, right: 8 }} onClick={() => setPreviewImage(null)}>Close</button>
            <div style={{ marginBottom: 8 }}>{previewImage.type.replace('_', ' ').toUpperCase()}</div>
            <img src={previewImage.img} alt={previewImage.type} style={{ maxWidth: '80vw', maxHeight: '80vh' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentApp;