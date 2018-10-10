
export default function (initialState, action) {
    initialState = {
        id: 1,
        showPointButtons: false,
        showLayoutButtons: true,
        showCreateFloorButton: false,
        showClearButton: false
    };
    
    switch (action.type) {
        case "UPDATE_EDITOR_UI":
            return {
                ...initialState,
                ...action.payload
            }
        default:
            return initialState
    }
}