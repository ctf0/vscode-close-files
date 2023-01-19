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
        vscode.commands.registerCommand(`${PACKAGE_NAME}.close_folder_files`, async (e) => await closeFolderFiles(e.fsPath)),
        vscode.commands.registerCommand(`${PACKAGE_NAME}.close_file_siblings`, async (e) => await closeFileSiblings())
    )
}

function readConfig() {
    config = vscode.workspace.getConfiguration(PACKAGE_NAME)
}

async function closeFolderFiles(folderPath, isFolder = true) {
    return Promise.all(
        vscode.window.tabGroups.all
            .flatMap((v) => v.tabs)
            .filter((tab) => {
                return tab.input !== undefined &&
                    tab.input instanceof vscode.TabInputText &&
                    tab.isDirty === false &&
                    checkForParentPath(folderPath, tab.input.uri.fsPath, isFolder)
            }).map(async (tab) => await vscode.window.tabGroups.close(tab))
    )
}

async function closeFileSiblings() {
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
