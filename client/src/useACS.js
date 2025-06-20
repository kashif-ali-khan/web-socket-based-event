import { useRef, useState, useEffect } from 'react';
import { CallClient, LocalVideoStream, LocalAudioStream } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

export const useACS = () => {
  const callRef = useRef(null);
  const callAgentRef = useRef(null);
  const deviceManagerRef = useRef(null);
  const localVideoStreamRef = useRef(null);
  const localAudioStreamRef = useRef(null);

  const [call, setCall] = useState(null);
  const [callAgent, setCallAgent] = useState(null);
  const [deviceManager, setDeviceManager] = useState(null);
  const [localVideoStream, setLocalVideoStream] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);
  const [localAudioStream, setLocalAudioStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (call) {
      const handleMuteChange = () => {
        setIsMuted(call.isMuted);
      };
      call.on('isMutedChanged', handleMuteChange);
      handleMuteChange();

      return () => {
        call.off('isMutedChanged', handleMuteChange);
      };
    } else {
      setIsMuted(false);
    }
  }, [call]);

  const init = async (token, displayName) => {
    const callClient = new CallClient();
    const tokenCredential = new AzureCommunicationTokenCredential(token);
    const agent = await callClient.createCallAgent(tokenCredential, { displayName });
    const dm = await callClient.getDeviceManager();

    callAgentRef.current = agent;
    setCallAgent(agent);
    deviceManagerRef.current = dm;
    setDeviceManager(dm);

    return { agent, dm };
  };

  const startCall = async (groupId, callOptions) => {
    if (!callAgentRef.current) {
      console.error("Call agent not initialized");
      return;
    }
    
    if (callOptions.audioOptions && callOptions.audioOptions.audioProcessingOptions === undefined) {
        callOptions.audioOptions.audioProcessingOptions = { enabled: false };
    }

    const call = callAgentRef.current.join({ groupId }, callOptions);
    callRef.current = call;
    setCall(call);

    call.on('remoteParticipantsUpdated', () => {
        setRemoteParticipants([...call.remoteParticipants]);
    });

    call.remoteParticipants.forEach(participant => {
        participant.on('stateChanged', () => {
            setRemoteParticipants([...call.remoteParticipants]);
        });
        participant.on('videoStreamsUpdated', () => {
            setRemoteParticipants([...call.remoteParticipants]);
        });
    });
  };

  const hangUp = async () => {
    if (callRef.current) {
      await callRef.current.hangUp({ forEveryone: true });
      callRef.current = null;
      setCall(null);
      setRemoteParticipants([]);
    }
  };
  
  const toggleMute = async () => {
    if (call) {
      try {
        if (call.isMuted) {
          await call.unmute();
        } else {
          await call.mute();
        }
      } catch (e) {
        console.error('Failed to toggle mute state', e);
      }
    }
  };

  const setupStreams = async (options = { video: true, audio: true }) => {
    if (deviceManagerRef.current) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: options.video, audio: options.audio });

            if (options.audio) {
                const microphones = await deviceManagerRef.current.getMicrophones();
                if (microphones.length > 0 && microphones[0].id !== 'camera-does-not-exist') {
                    const audioStream = new LocalAudioStream(microphones[0]);
                    localAudioStreamRef.current = audioStream;
                    setLocalAudioStream(audioStream);
                } else {
                     console.warn("No microphone devices found.");
                }
            }

            if (options.video) {
                const cameras = await deviceManagerRef.current.getCameras();
                if (cameras.length > 0) {
                  const videoStream = new LocalVideoStream(cameras[0]);
                  localVideoStreamRef.current = videoStream;
                  setLocalVideoStream(videoStream);
                } else {
                    console.warn("No camera devices found.");
                }
            }
        } catch (e) {
            console.error('Failed to setup streams', e);
        }
    }
  }

  return { 
    init, 
    startCall, 
    hangUp, 
    call, 
    localVideoStream,
    localAudioStream, 
    remoteParticipants, 
    deviceManager,
    setupStreams,
    isMuted,
    toggleMute
  };
};