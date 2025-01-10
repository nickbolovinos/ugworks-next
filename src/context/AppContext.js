import { createContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [basename, setBasename] = useState('default');

    return (
        <AppContext.Provider value={{ basename, setBasename }}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;
