import React, { createContext, useContext, useEffect, useState } from 'react';
import { useACS } from './useACS';

const ACSContext = createContext(null);

export const useACSContext = () => useContext(ACSContext);

export const ACSProvider = ({ children, displayName }) => {
    const [token, setToken] = useState(null);
    const acs = useACS();

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const res = await fetch('http://localhost:8080/token');
                const { token: fetchedToken, userId } = await res.json();
                setToken(fetchedToken);
                await acs.init(fetchedToken, displayName);
            } catch (e) {
                console.error('Failed to fetch token', e);
            }
        };
        fetchToken();
    }, [displayName]);

    return (
        <ACSContext.Provider value={acs}>
            {children}
        </ACSContext.Provider>
    );
}; 