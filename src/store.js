import { configureStore, createSlice, current } from '@reduxjs/toolkit'

let user = createSlice({
  name : 'user',
  initialState : {id: "", profile_img: ""},
  reducers : {
    setUserId(state, action){
        state.id = action.payload;
        // console.log('redux setUserId: ', current(state));
    },
    setProfileImg(state, action){
        state.profile_img = action.payload;
        // console.log('redux setProfileImg: ', current(state));
    }
}
});

let gameInfo = createSlice({
  name : 'gameInfo',
  initialState : [null, null, 1],
  reducers : {
    turnStatusChange(state, action){
      state[0] = action.payload[0];
      state[1] = action.payload[1];
      // console.log('redux turnStatusChange: ', current(state));
    },
    surviveStatusChange(state, action){
      state[2] = action.payload;
      // console.log('redux surviveStatusChange: ', current(state));
    }
}
});

let FriendInfo = createSlice({
  name : 'friendInfo',
  initialState: {},
  reducers : {
    FriendInfoSet(state, action){
      state[action.payload[0]] = action.payload[1];
      // console.log('redux FriendInfoSet: ', current(state))
    },
    FriendInfoChange(state, action){
      if (state[action.payload[0]] !== undefined){
        state[action.payload[0]] = action.payload[1];
        // console.log('redux FriendInfoChange: ',current(state));
      }
    },
    FriendInfoReset(state, action){
      // console.log('redux FriendInfoReset');
      return {};
    }
  }
})

let videoInfo = createSlice({
  name : 'videoInfo',
  initialState : {stream: null},
  reducers : {
    VideoStreamChange(state, action){
        state.stream = action.payload;
        // console.log("redux VideoStreamChange: ", current(state));
    },
    VideoStreamReset(state, action) {
        return {stream: null};
    }
}
});



const store = configureStore({
  reducer: {
    user : user.reducer,
    FriendInfo : FriendInfo.reducer,
    gameInfo : gameInfo.reducer,
    videoInfo : videoInfo.reducer
  },

  middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware({
    serializableCheck: false
  }),
});

export {store};

export let { setUserId, setProfileImg } = user.actions;
export let { FriendInfoSet, FriendInfoChange, FriendInfoReset } = FriendInfo.actions;
export let { turnStatusChange, surviveStatusChange } = gameInfo.actions;
export let { VideoStreamChange, VideoStreamReset } = videoInfo.actions;
