import React, { useEffect, useRef, useState } from 'react';
import { VideoStreamRenderer } from '@azure/communication-calling';

const VideoCard = ({ stream, displayName, onVideoReady, containerStyle }) => {
    const videoContainerRef = useRef(null);
    const rendererRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!stream) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let isCancelled = false;
        
        const createAndRenderStream = async () => {
            try {
                const renderer = new VideoStreamRenderer(stream);
                rendererRef.current = renderer;
                
                const view = await renderer.createView({ scalingMode: 'Crop' });

                if (isCancelled) {
                    renderer.dispose();
                    return;
                }

                if (videoContainerRef.current) {
                    videoContainerRef.current.innerHTML = '';
                    videoContainerRef.current.appendChild(view.target);
                    const videoEl = view.target.querySelector('video');
                    if (videoEl) {
                        videoEl.onplaying = () => {
                            if (!isCancelled) {
                                setIsLoading(false);
                            }
                        };
                        if (onVideoReady) {
                            onVideoReady(videoEl);
                        }
                    } else {
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                if (!isCancelled) {
                    console.warn(`Failed to render video stream: ${error.message}`);
                    setIsLoading(false);
                }
            }
        };

        createAndRenderStream();

        return () => {
            isCancelled = true;
            if (rendererRef.current) {
                rendererRef.current.dispose();
                rendererRef.current = null;
            }
            if (onVideoReady) {
                onVideoReady(null);
            }
        };
    }, [stream, onVideoReady]);

    const baseStyle = {
        width: 200, height: 150, margin: 5, backgroundColor: 'black', 
        position: 'relative', overflow: 'hidden', 
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    return (
        <div style={{...baseStyle, ...containerStyle}}>
            {isLoading && <div style={{ color: 'white', fontSize: '14px' }}>Loading...</div>}
            <div ref={videoContainerRef} style={{ width: '100%', height: '100%', display: isLoading ? 'none' : 'block' }}></div>
            {!isLoading && displayName && <div style={{ position: 'absolute', bottom: 0, left: 0, color: 'white', padding: 5, background: 'rgba(0,0,0,0.5)' }}>{displayName}</div>}
        </div>
    );
};

export default VideoCard; 