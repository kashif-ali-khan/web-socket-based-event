import React, { useEffect, useRef, useState } from 'react';
import { useWebSocket } from './useWebSocket';
import ProgressBar from './ProgressBar';
import SummaryTable from './SummaryTable';
import { useACSContext } from './ACSProvider';
import VideoCard from './VideoCard';
import { v4 as uuidv4 } from 'uuid';

const questions = [
  'What is your full name?',
  'What is your date of birth?',
  'What is your address?',
  'Please show your ID to the camera.',
];

const CustomerApp = () => {
  const localVideoElement = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [captureType, setCaptureType] = useState(null);
  const [question, setQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuestionStarted, setIsQuestionStarted] = useState(false);
  const [responses, setResponses] = useState({});

  const { init, startCall, hangUp, localVideoStream, remoteParticipants, deviceManager, setupStreams, call, isMuted, toggleMute } = useACSContext();

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
    if (deviceManager) {
      setupStreams({ video: true, audio: true });
    }
  }, [deviceManager]);
  
  const handleLocalVideoReady = (videoElement) => {
    localVideoElement.current = videoElement;
  };

  const handleStartCall = () => {
    const newGroupId = uuidv4();
    sendMessage('initiate_call', 'agent1', { groupId: newGroupId });
    const callOptions = {
        videoOptions: { localVideoStreams: localVideoStream ? [localVideoStream] : [] },
        audioOptions: { muted: false }
    };
    startCall(newGroupId, callOptions);
  };

  const agentParticipant = remoteParticipants.find(p => p.videoStreams.some(s => s.isAvailable));
  const agentStream = agentParticipant?.videoStreams.find(s => s.isAvailable);

  const capturePhoto = async (to, type) => {
    const video = localVideoElement.current;
    if (!video) {
        console.error("Local video element not available for capture.");
        return;
    }
    
    const canvas = document.createElement('canvas');
    if (video.readyState < video.HAVE_METADATA) {
        await new Promise(resolve => video.onloadedmetadata = resolve);
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    sendMessage(`${type}_captured`, to, { imageData });
    
    setShowOverlay(false);
  };

  // Function to check if all questions have responses
  const allAnswered = questions.every(q => responses[q]);

  return (
    <div>
      <h2>Customer App</h2>
      <div>
        <h3>Video Call</h3>
        {!call && <button onClick={handleStartCall} disabled={!localVideoStream}>Start Call</button>}
        {call && (
          <>
            <button onClick={hangUp}>Hang Up</button>
            <button onClick={toggleMute}>{isMuted ? 'Unmute' : 'Mute'}</button>
          </>
        )}
        
        <div style={{ 
            position: 'relative', 
            width: '640px', 
            height: '480px', 
            backgroundColor: '#f0f0f0', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            {/* Local (Customer) Video - Main View */}
            {localVideoStream ? (
                <VideoCard 
                    stream={localVideoStream} 
                    displayName="Me"
                    onVideoReady={handleLocalVideoReady}
                    containerStyle={{ width: '100%', height: '100%', margin: 0 }} 
                />
            ) : (
                 <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666'}}>
                    Setting up your camera...
                </div>
            )}
            
            {showOverlay && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
                     <div
                        style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: 'white', fontSize: 18, fontWeight: 'bold',
                            textAlign: 'center',
                            border: captureType === 'face' ? '3px solid lime' : '3px dashed yellow'
                        }}
                    >
                        {captureType === 'face' ? 'Align face' : 'Show ID'}
                    </div>
                </div>
            )}

            {/* Remote (Agent) Video - Picture-in-Picture */}
            {agentStream && (
                <div style={{ position: 'absolute', top: 20, right: 20, width: 180, height: 135, zIndex: 100, border: '2px solid white', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                    <VideoCard 
                        stream={agentStream}
                        displayName={agentParticipant.displayName || 'Agent'}
                        containerStyle={{ width: '100%', height: '100%', margin: 0 }}
                    />
                </div>
            )}
        </div>
      </div>

      {isQuestionStarted && (
        <ProgressBar current={currentQuestionIndex} total={questions.length} questions={questions} responses={responses} />
      )}
      {/* Display the current question if available */}
      {question && (
        <div style={{
          background: '#f5f5f5', padding: '16px', borderRadius: '8px',
          marginBottom: '16px', fontSize: '20px', fontWeight: 'bold',
          color: '#333', maxWidth: 640
        }}>
          {question}
          {responses[question] && (
            <div style={{
              marginTop: '12px', fontSize: '16px', color: '#666',
              borderTop: '1px solid #ddd', paddingTop: '12px'
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
    </div>
  );
};

export default CustomerApp;