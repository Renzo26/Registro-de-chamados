const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let backendProcess;
let apiProcess;
let mainWindow;
let backendPath = path.join(process.resourcesPath, 'backend.exe');
let apiPath = path.join(process.resourcesPath, 'api.exe');


function startBackend() {
    const backendPath = process.env.NODE_ENV === 'development'
        ? path.join(__dirname, 'resources', 'backend.exe')
        : path.join(process.resourcesPath, 'backend.exe');

    const apiPath = process.env.NODE_ENV === 'development'
        ? path.join(__dirname, 'resources', 'api.exe')
        : path.join(process.resourcesPath, 'api.exe');

    console.log(`📂 Backend Path: ${backendPath}`);
    console.log(`📂 API Path: ${apiPath}`);

    if (!fs.existsSync(backendPath)) {
        console.error("❌ Erro: backend.exe não encontrado!", backendPath);
        return;
    }

    console.log(`🟢 Iniciando backend em: ${backendPath}`);
    backendProcess = spawn(backendPath, [], {
        cwd: path.dirname(backendPath),
        detached: false,
        shell: false
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`📡 Backend stdout: ${data.toString()}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`❌ Backend stderr: ${data.toString()}`);
    });

    backendProcess.on('close', (code) => {
        console.error(`⚠️ Backend foi encerrado com código ${code}`);
    });

    if (!fs.existsSync(apiPath)) {
        console.error("❌ Erro: api.exe não encontrado!", apiPath);
        return;
    }

    console.log(`🟢 Iniciando API em: ${apiPath}`);
    apiProcess = spawn(apiPath, [], {
        cwd: path.dirname(apiPath),
        detached: false,
        shell: false
    });

    apiProcess.stdout.on('data', (data) => {
        console.log(`📡 API stdout: ${data.toString()}`);
    });

    apiProcess.stderr.on('data', (data) => {
        console.error(`❌ API stderr: ${data.toString()}`);
    });

    apiProcess.on('close', (code) => {
        console.error(`⚠️ API foi encerrada com código ${code}`);
    });

    console.log("✅ API iniciada com sucesso!");
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html')).catch((err) => {
        console.error("❌ Erro ao carregar a interface:", err);
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    if (backendProcess) {
        console.log("🛑 Encerrando backend...");
        backendProcess.kill();
    }
    if (apiProcess) {
        console.log("🛑 Encerrando API...");
        apiProcess.kill();
    }
});
