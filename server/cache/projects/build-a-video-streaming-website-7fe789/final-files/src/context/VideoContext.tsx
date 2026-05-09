import { createContext, useContext, useReducer, ReactNode } from 'react';

interface VideoState {
  videos: any[];
  loading: boolean;
  error: string | null;
}

const initialState: VideoState = {
  videos: [],
  loading: false,
  error: null,
};

const VideoContext = createContext<{
  state: VideoState;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null,
});

const videoReducer = (state: VideoState, action: any): VideoState => {
  switch (action.type) {
    case 'FETCH_VIDEOS_REQUEST':
      return { ...state, loading: true, error: null };
    case 'FETCH_VIDEOS_SUCCESS':
      return { ...state, loading: false, videos: action.payload };
    case 'FETCH_VIDEOS_FAILURE':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  return (
    <VideoContext.Provider value={{ state, dispatch }}>
      {children}
    </VideoContext.Provider>
  );
};

const useVideo = () => useContext(VideoContext);

export { VideoContext, VideoProvider, useVideo };
