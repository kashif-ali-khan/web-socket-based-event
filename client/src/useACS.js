import { useEffect, useRef } from 'react';
import { CallClient, AzureCommunicationTokenCredential } from '@azure/communication-calling';

export const useACS = (token, displayName) => {
  const callRef = useRef(null);
  const callAgentRef = useRef(null);

  useEffect(() => {
    const setup = async () => {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      callAgentRef.current = await callClient.createCallAgent(tokenCredential, { displayName });
    };
    setup();
  }, [token, displayName]);

  const joinCall = (groupId, localVideoStream, deviceManager) => {
    return callAgentRef.current.join({ groupId }, { videoOptions: { localVideoStreams: [localVideoStream] } });
  };

  return { joinCall };
};