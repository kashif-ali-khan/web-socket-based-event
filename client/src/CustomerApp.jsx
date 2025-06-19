import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import ProgressBar from './ProgressBar';
import SummaryTable from './SummaryTable';

const questions = [
  'What is your full name?',
  'What is your date of birth?',
  'What is your address?',
  'Please show your ID to the camera.',
];

const CustomerApp = () => {
  const videoRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [captureType, setCaptureType] = useState(null);
  const [question, setQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuestionStarted, setIsQuestionStarted] = useState(false);
  const [responses, setResponses] = useState({});

  const sendMessage = useWebSocket('customer1', (msg) => {
    if (msg.type === 'photo_ready') {
      setCaptureType('face');
      setShowOverlay(true);
    } else if (msg.type === 'photo_capture') {
      capturePhoto(msg.from, 'face');
    } else if (msg.type === 'id_ready') {
      setCaptureType('id');
      setShowOverlay(true);
    } else if (msg.type === 'id_capture') {
      capturePhoto(msg.from, 'id');
    } else if (msg.type === 'question') {
      setQuestion(msg.payload?.question || '');
      // Find the index of the question in the questions array
      const idx = questions.findIndex(q => q === msg.payload?.question);
      setCurrentQuestionIndex(idx >= 0 ? idx : 0);
    } else if (msg.type === 'question_started') {
      setIsQuestionStarted(true);
    } else if (msg.type === 'submit_response') {
      const { question, response } = msg.payload;
      setResponses(prev => ({
        ...prev,
        [question]: response
      }));
    }
  });

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    };
    setupCamera();
  }, []);

  const capturePhoto = (to, type) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    sendMessage(`${type}_captured`, to, { imageData });
    setShowOverlay(false);
  };

  // Function to check if all questions have responses
  const allAnswered = questions.every(q => responses[q]);

  return (
    <div>
      <h2>Customer App</h2>
      {isQuestionStarted && (
        <ProgressBar current={currentQuestionIndex} total={questions.length} questions={questions} responses={responses} />
      )}
      {/* Display the current question if available */}
      {question && (
        <div style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          maxWidth: 640
        }}>
          {question}
          {responses[question] && (
            <div style={{
              marginTop: '12px',
              fontSize: '16px',
              color: '#666',
              borderTop: '1px solid #ddd',
              paddingTop: '12px'
            }}>
              <strong>Your Response:</strong> {responses[question]}
            </div>
          )}
        </div>
      )}

      {/* Show summary table if all questions are answered */}
      {allAnswered && (
        <SummaryTable questions={questions} responses={responses} />
      )}
      <div style={{ position: 'relative', width: 640, height: 480 }}>
        <video ref={videoRef} autoPlay muted playsInline width={640} height={480} style={{ borderRadius: 8 }} />
        {showOverlay && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 24,
              fontWeight: 'bold',
              zIndex: 10,
              border: captureType === 'face' ? '4px solid lime' : '4px dashed yellow'
            }}
          >
            {captureType === 'face' ? 'Align your face' : 'Show your ID card'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerApp;