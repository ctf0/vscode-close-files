const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    // close_non_dirty
    const dirty = vscode.commands.registerCommand('extension.close_non_dirty', () => {
        // get opened editors
        // check if its "!isDirty"
        // and close it
    })

    // close_folder_files
    const folder = vscode.commands.registerCommand('extension.close_folder_files', (e) => {
        let folder = e.fsPath
        // get opened editors
        // check if each one filename starts with the "folder" name
        // if so then close it
    })

    context.subscriptions.push(dirty, folder)
}
exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
