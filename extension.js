const vscode = require('vscode')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    /* ----------------------------- close_non_dirty ---------------------------- */
    let dirtyDocs = []
    let dirtyLoop = false

    const dirtyFiles = vscode.commands.registerCommand('extension.close_non_dirty', () => {
        dirtyLoop = true
        loopOver(vscode.window.activeTextEditor.document, dirtyDocs)
    })

    /* --------------------------- close_folder_files --------------------------- */
    let folderDocs = []
    let folderPath = null
    let folderLoop = false

    const folderFiles = vscode.commands.registerCommand('extension.close_folder_files', (e) => {
        folderLoop = true
        folderPath = e.fsPath

        let doc = vscode.window.activeTextEditor.document
        let name = doc.fileName

        if (inFolder(name, folderPath)) {
            loopOver(doc, folderDocs)
        } else {
            folderDocs.push(name)
            goNext()
        }
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
        if (e) {
            clearTimeout(timmer)

            let doc = e.document
            let name = doc.fileName

            /* ------------------------------- dirty files ------------------------------ */
            if (dirtyLoop) {
                // are we back to where we started ?
                if (isFirstItem(name, dirtyDocs)) {
                    dirtyDocs = []
                    dirtyLoop = false

                    return
                }

                loopOver(doc, dirtyDocs)
            }

            /* ------------------------------ folder files ------------------------------ */
            if (folderLoop) {
                // are we back to where we started ?
                if (isFirstItem(name, folderDocs)) {
                    folderDocs = []
                    folderPath = null
                    folderLoop = false

                    return
                }

                if (inFolder(name, folderPath)) {
                    loopOver(doc, folderDocs)
                } else {
                    folderDocs.push(name)
                    goNext()
                }
            }
        }
    })
}

function loopOver(doc, list) {
    let name = doc.fileName

    if (doc.isDirty) {
        if (!inList(name, list)) {
            list.push(name)
        }

        goNext()
    } else {
        vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    }
}

function goNext() {
    vscode.commands.executeCommand('workbench.action.nextEditor')
}

function inList(item, list) {
    return list.some((e) => e == item)
}

function isFirstItem(item, list) {
    return list.length && list[0] == item
}

function inFolder(name, path) {
    return name.startsWith(path)
}

exports.activate = activate

function deactivate() { }

module.exports = {
    activate,
    deactivate
}
