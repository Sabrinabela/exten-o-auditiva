// Arquivo: popup.js

// ⚠️ ATUALIZE ESTE VALOR: Deve ser o DOMÍNIO (protocolo e host) do seu arquivo hospedado
// Exemplo: "https://usuario.github.io"
const TARGET_ORIGIN = "https://sabrinabela.github.io/extencaovisound/"; 

const statusDiv = document.getElementById('status');
const iframe = document.getElementById('vlibrasFrame');

// Função que será injetada para obter o texto na página web
function getSelectedText() {
    return window.getSelection().toString();
}

// Handler de carregamento para saber quando o iframe está pronto
iframe.onload = function() {
    statusDiv.textContent = "Intérprete carregado. Selecione e traduza.";
};


document.getElementById('translateButton').addEventListener('click', async () => {
    
    if (statusDiv.textContent.includes("Aguardando carregamento")) {
        statusDiv.textContent = "Aguarde o intérprete carregar ou recarregue a extensão.";
        return; 
    }

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    try {
        // 1. Injeta o script para pegar o texto
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: getSelectedText, 
        });

        const selectedText = injectionResults[0].result;
        
        if (selectedText && selectedText.trim() !== "") {
            statusDiv.textContent = `Traduzindo: "${selectedText.substring(0, 50)}..."`;
            
            // 2. Envia o texto para o iframe externo
            iframe.contentWindow.postMessage({
                action: 'translate',
                text: selectedText
            }, TARGET_ORIGIN); // ⚠️ Usa o domínio configurado
            
        } else {
            statusDiv.textContent = 'Nenhum texto selecionado. Tente novamente.';
        }
    } catch (e) {
        statusDiv.textContent = 'Erro de script. Não é possível rodar nesta página.';
        console.error("Falha na injeção ou comunicação:", e);
    }
});