const vscode = require('vscode')
const path   = require('path')

const PACKAGE_NAME = 'closeFiles'
let config         = {}

function activate(context) {
    readConfig()

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration(PACKAGE_NAME)) {
            readConfig()
        }
    })

    context.subscriptions.push(
        vscode.commands.registerCommand(`${PACKAGE_NAME}.close_folder_files`, (e) => closeFolderFiles(e.fsPath)),
        vscode.commands.registerCommand(`${PACKAGE_NAME}.close_file_siblings`, (e) => closeFileSiblings())
    )
}

function readConfig() {
    config = vscode.workspace.getConfiguration(PACKAGE_NAME)
}

function closeFolderFiles(folderPath, isFolder = true) {
    return vscode.window.tabGroups.all
        .flatMap((v) => v.tabs)
        .filter((tab) => {
            return tab.input !== undefined &&
                tab.input instanceof vscode.TabInputText &&
                tab.isDirty === false &&
                checkForParentPath(folderPath, tab.input.uri.fsPath, isFolder)
        }).map((tab) => vscode.window.tabGroups.close(tab))
}

function closeFileSiblings() {
    let current = vscode.window.activeTextEditor.document?.fileName

    return closeFolderFiles(path.dirname(current), false)
}

function checkForParentPath(folderPath, docPath, isFolder)
{
    if (isFolder) {
        return docPath.startsWith(folderPath)
    }

    return useStrictOption()
        ? folderPath === path.dirname(docPath)
        : docPath.startsWith(folderPath)
}

function useStrictOption()
{
    return config.closingType == 'strict'
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
