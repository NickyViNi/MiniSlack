import { createSelector } from "reselect";
import { csrfFetch } from "./csrf";
import * as messageActions from "./message";

// Action
const GET_CHANNELS = "channels/GET_CHANNELS";
const ADD_CHANNEL = "channels/ADD_CHANNEL";
const UPDATE_CHANNEL = "channels/UPDATE_CHANNEL"
const DELETE_CHANNEL = "channels/DELETE_CHANNEL"
const RESET = 'channels/RESET';


// POJO action creators
const getChannelsAction = channels => ({
  type: GET_CHANNELS,
  channels
});

export const createChannelsAction = channel => ({
  type: ADD_CHANNEL,
  channel
});

export const updateChannelAction = channel => ({
  type: UPDATE_CHANNEL,
  channel
});

export const deleteChannelAction = channelId => ({
  type: DELETE_CHANNEL,
  channelId
});

export const reset = () => ({
  type: RESET
});


// Thunk action creators
export const loadChannels = workspaceId => async (dispatch, getState) => {
  const channels = Object.values(getState().channels.channels);
  if (channels.length && channels[0].workspace_id === workspaceId) return false;;
  const res = await csrfFetch(`/api/workspaces/${workspaceId}/channels`);
  const data = await res.json();
  if (!res.ok) return { errors: data };
  dispatch(getChannelsAction(data.Channels));
  dispatch(messageActions.reset());
  return true;
}

export const updateChannelThunk = (channelId, payload) => async dispatch => {
  const res = await csrfFetch(`/api/channels/${channelId}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload
    })
  });
  const data = await res.json();
  if (!res.ok) return { errors: data };
  dispatch(updateChannelAction(data));
}

export const deleteChannelThunk = (channelId, isChannelMsg) => async dispatch => {
  const res = await csrfFetch(`/api/channels/${channelId}`, {
    method: 'DELETE'
  });
  const data = res.json();
  if (!res.ok) return { errors: data };
  dispatch(deleteChannelAction(channelId));
  if (isChannelMsg) dispatch(messageActions.reset());
}

export const createChannelThunk = (workspaceId, channel) => async dispatch => {
  const res = await csrfFetch(`/api/workspaces/${workspaceId}/channels`, {
    method: "POST",
    body: JSON.stringify({
      ...channel
    })
  });
  const data = await res.json();
  if (!res.ok) return { errors: data };
  dispatch(createChannelsAction(data));

}


// Custom selectors
export const getChannels = createSelector(
  state => state.channels.channels,
  channels => Object.values(channels)
);


// Reducer
const initialState = { channels: {} };

export default function channelReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CHANNELS: {
      const allChannels = {};
      action.channels.forEach(channel => allChannels[channel.id] = channel);
      return { ...state, channels: allChannels }
    }
    case ADD_CHANNEL: {
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.channel.id]: action.channel
        }
      }
    }
    case UPDATE_CHANNEL: {
      return {
        ...state,
        channels: {
          ...state.channels,
          [action.channel.id]: action.channel
        }
      }
    }
    case DELETE_CHANNEL: {
      const allChannels = { ...state.channels };
      delete allChannels[action.channelId];
      return { ...state, channels: allChannels }
    }
    case RESET:
      return { ...state, channels: {} };
    default:
      return state;
  }
}
