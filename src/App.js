import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { v4 as uuid } from 'uuid';

function App() {
    const [fingerprint, setFingerPrint] = useState('');
    const [requestID, setRequestID] = useState('');
    const [message, setMessage] = useState('');
    const [clientSessionId, setClientSessionId] = useState(''); // State for the clientSessionId

    useEffect(() => {
        const loadFingerprint = async () => {
            let storedFingerprint = localStorage.getItem('browserFingerprint');
            let storedRequestID = localStorage.getItem('requestID');  // Load Request ID from local storage.
            let storedClientSessionId = sessionStorage.getItem('clientSessionId'); //Get clientSessionId

            if (!storedRequestID) {
                storedRequestID = uuid();
                localStorage.setItem('requestID', storedRequestID);
            }

            if (!storedFingerprint) {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                storedFingerprint = result.visitorId;
                localStorage.setItem('browserFingerprint', storedFingerprint);
            }

            setFingerPrint(storedFingerprint);
            setRequestID(storedRequestID);  //Set Request ID
            if (storedClientSessionId) {
                setClientSessionId(storedClientSessionId);
            }
        };

        loadFingerprint();
    }, []);

    const sendRequest = async () => {
        try {
            const requestData = {
                bfg: fingerprint,
                rid: requestID,
                clientSessionId: clientSessionId // Include clientSessionId
            };

            // Important:  Set withCredentials: true to send cookies with the request.
            const res = await axios.post('https://test-server-0p54.onrender.com', requestData, {
                withCredentials: true,
            });

            setMessage(res.data.msg);

            //First Time Session:
            if (res.data.clientSessionId) {
                setClientSessionId(res.data.clientSessionId); //Save state for subsequent requests
                sessionStorage.setItem('clientSessionId', res.data.clientSessionId); // Store clientSessionId
            }

        } catch (error) {
            console.error(error);
            setMessage(`Error: ${error.message}`); // Show error message

        }
    };

    return (
        <div>
            <p>Fingerprint: {fingerprint}</p>
            <p>Request ID: {requestID}</p>  //Request ID
            <p>Client Session ID: {clientSessionId}</p> // Client Session ID
            <p>Response: {message}</p>
            <button onClick={sendRequest}>Send Request</button>
        </div>
    );
}

export default App;
