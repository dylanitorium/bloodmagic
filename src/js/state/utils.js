export const createReducer = (initialState, handlers) =>  (
  (state = initialState, action)  => {
    if (handlers.hasOwnProperty(action.type)) { //eslint-disable-line
      return handlers[action.type](state, action);
    }
    return state;
  }
);

export const makeActionCreator = (type, ...parameterNames) => (
  (...parameters) => {
    const action = { type };
    parameterNames.forEach((parameter, index) => {
      action[parameterNames[index]] = parameters[index];
    });
    return action;
  }
);


