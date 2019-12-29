const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    /* ----------------------------- close_non_dirty ---------------------------- */
    let dirtyDocs = []
    let dirtyLoop = false

    const dirtyFiles = vscode.commands.registerCommand('extension.close_non_dirty', async () => {
        dirtyLoop = true

        return loopOver(vscode.window.activeTextEditor.document, dirtyDocs)
    })

    /* --------------------------- close_folder_files --------------------------- */
    let folderDocs = []
    let folderPath = null
    let folderLoop = false

    const folderFiles = vscode.commands.registerCommand('extension.close_folder_files', async (e) => {
        folderLoop = true
        folderPath = e.fsPath

        let doc = vscode.window.activeTextEditor.document
        let name = doc.fileName

        await inFolderCheck(
            name,
            folderPath,
            doc,
            folderDocs
        )
    })

    context.subscriptions.push(dirtyFiles, folderFiles)

    /* ------------------------------- recurssion ------------------------------- */
    let timmer

    vscode.window.onDidChangeActiveTextEditor((e) => {
        // stop & reset all
        if (!e) {
            clearTimeout(timmer)

            timmer = setTimeout(() => {
                if (!vscode.window.visibleTextEditors.length && (dirtyLoop || folderLoop)) {
                    dirtyDocs = []
                    dirtyLoop = false
                    folderDocs = []
                    folderPath = null
                    folderLoop = false
                }
            }, 200)
        }

        // have files
        else {
            clearTimeout(timmer)

            let doc = e.document
            let name = doc.fileName

            /* ------------------------------- dirty files ------------------------------ */
            if (dirtyLoop) {
                // are we back to where we started ?
                if (!isFirstItem(name, dirtyDocs)) {
                    return loopOver(doc, dirtyDocs)
                }

                dirtyDocs = []
                dirtyLoop = false
            }

            /* ------------------------------ folder files ------------------------------ */
            if (folderLoop) {
                // are we back to where we started ?
                if (!isFirstItem(name, folderDocs)) {
                    return inFolderCheck(
                        name,
                        folderPath,
                        doc,
                        folderDocs
                    )
                }

                folderDocs = []
                folderPath = null
                folderLoop = false
            }
        }
    })
}

async function loopOver(doc, list) {
    let name = doc.fileName
    let dirty = doc.isDirty

    if (dirty) {
        list.push(name)
        await goNext()
    } else {
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    }
}

async function goNext() {
    return vscode.commands.executeCommand('workbench.action.nextEditor')
}

function isFirstItem(item, list) {
    return list.length && list[0] == item
}

async function inFolderCheck(name, path, doc, list) {
    if (!name.startsWith('Untitled') && name.startsWith(path)) {
        await loopOver(doc, list)
    } else {
        list.push(name)
        await goNext()
    }
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
