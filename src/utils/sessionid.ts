// utils/sessionid.ts
export const getSessionId = (): string => {
  // Try to get existing sessionId from localStorage
  let sessionId = localStorage.getItem('sessionId');
  
  // If doesn't exist, generate new one
  if (!sessionId) {
    sessionId = generateSessionId(); // Your existing ID generation logic
    localStorage.setItem('sessionId', sessionId);
  }
  
  return sessionId;
};

const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};