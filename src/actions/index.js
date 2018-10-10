export const updateEditorUI = (editorUI) => {
    console.log("Update UI requested !!");
    return {
        type: "UPDATE_EDITOR_UI",
        payload: editorUI
    };
}