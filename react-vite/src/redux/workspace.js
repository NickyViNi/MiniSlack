import { createSelector } from "reselect";
import { csrfFetch } from "./csrf";

// Actions
const LOAD_WORKSPACES = 'worksapce/LOAD_WORKSPACES';
const RESET = 'workspaces/RESET';
const CREATE_WORKSPACE = "workspace/CREATE_WORKSPACE";
const EDIT_WORKSPACE = "workspace/EDIT_WORKSPACE";
const EDLETE_WORKSPACE = "workspace/EDLETE_WORKSPACE";

// POJO action creators
const loadWorkspacesAction = workspaces => ({
  type: LOAD_WORKSPACES,
  workspaces
});

const createWorkspaceAction = workspace => {
  return {
    type: CREATE_WORKSPACE,
    workspace
  }
}

export const reset = () => ({
  type: RESET
});


// Thunk action creators
export const loadWorkspaces = () => async (dispatch, getState) => {
  if (Object.values(getState().workspaces.workspaces).length) return;
  const response = await csrfFetch("/api/workspaces/");
  const data = await response.json();
  if (!response.ok) return { errors: data };
  dispatch(loadWorkspacesAction(data.JoinedWorkspaces));
}

export const createWorkspaceThunk = (workspace) => async dispatch => {
  const res = await csrfFetch(`/api/workspaces/`, {
      method: "POST",
      body: JSON.stringify(workspace)
  });
  const data = await res.json();
  if (!res.ok) return {errors: data}
  dispatch(createWorkspaceAction(data))
}


// Custom selectors
export const getWorkspaces = createSelector(
  state => state.workspaces.workspaces,
  workspaces => Object.values(workspaces)
)


// Reducer
const initialState = { workspaces: {} };

function workspaceReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_WORKSPACES: {
      const allWorkspace = {}
      action.workspaces.forEach(wo => allWorkspace[wo.id] = wo)
      return {...state, workspaces: allWorkspace}
    }
    case CREATE_WORKSPACE: {
      return {
        ...state,
        workspaces: {
          ...state.workspaces,
          [action.workspace.id]: action.workspace
        }
      }
    }

    case RESET:
      return initialState;
    default:
      return state;
  }
}

export default workspaceReducer;
