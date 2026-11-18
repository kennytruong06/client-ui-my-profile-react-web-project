import { createContext, useContext } from 'react';

export const SceneContext = createContext({ hour: 12, night: 0, warm: 0 });

export const useSceneLight = () => useContext(SceneContext);
