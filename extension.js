const vscode = require('vscode')

let dirtyDocs = []
let dirtyLoop = false
let folderDocs = []
let folderPath = null
let folderLoop = false

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    /* ----------------------------- close_non_dirty ---------------------------- */
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.close_non_dirty', async () => {
            dirtyLoop = true
            await loopOver(vscode.window.activeTextEditor.document, dirtyDocs)
        })
    )

    /* --------------------------- close_folder_files --------------------------- */
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.close_folder_files', async (e) => {
            folderLoop = true
            folderPath = e.fsPath

            await inFolderCheck(
                folderPath,
                vscode.window.activeTextEditor.document,
                folderDocs
            )
        })
    )

    /* ------------------------------- recurssion ------------------------------- */
    let timer

    vscode.window.onDidChangeActiveTextEditor(async (e) => {
        // stop & reset all
        if (!e) {
            clearTimeout(timer)

            timer = setTimeout(() => {
                if (!vscode.window.visibleTextEditors.length) {
                    resetAll()
                }
            }, 200)
        }

        // have files
        else {
            clearTimeout(timer)

            let doc = e.document
            let name = doc.fileName

            /* ------------------------------- dirty files ------------------------------ */
            if (dirtyLoop) {
                // are we back to where we started ?
                if (!isFirstItem(name, dirtyDocs)) {
                    await loopOver(doc, dirtyDocs)
                } else {
                    dirtyDocs = []
                    dirtyLoop = false
                }
            }

            /* ------------------------------ folder files ------------------------------ */
            if (folderLoop) {
                // are we back to where we started ?
                if (!isFirstItem(name, folderDocs)) {
                    await inFolderCheck(
                        folderPath,
                        doc,
                        folderDocs
                    )
                } else {
                    folderDocs = []
                    folderPath = null
                    folderLoop = false
                }
            }
        }
    })
}

async function loopOver(doc, list) {
    let name = doc.fileName
    let dirty = doc.isDirty

    if (dirty) {
        list.push(name)

        return goNext()
    } else {
        return vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    }
}

async function goNext() {
    return vscode.commands.executeCommand('workbench.action.nextEditor')
}

function isFirstItem(item, list) {
    return list.length && list[0] == item
}

async function inFolderCheck(path, doc, list) {
    let name = doc.fileName

    if (!doc.isUntitled && name.startsWith(path)) {
        await loopOver(doc, list)
    } else {
        list.push(name)
        await goNext()
    }
}

function resetAll() {
    dirtyDocs = []
    dirtyLoop = false
    folderDocs = []
    folderPath = null
    folderLoop = false
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
