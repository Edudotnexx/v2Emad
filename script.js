document.addEventListener('DOMContentLoaded', function () {
    const configList = document.getElementById('config-list');
    const addConfigBtn = document.getElementById('add-config');
    const configEditor = document.getElementById('config-editor');
    const configNameInput = document.getElementById('config-name');
    const configContentInput = document.getElementById('config-content');
    const saveConfigBtn = document.getElementById('save-config');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const importConfigBtn = document.getElementById('import-config');
    const exportConfigBtn = document.getElementById('export-config');
    const fileInput = document.getElementById('file-input');

    let configs = JSON.parse(localStorage.getItem('v2ray-configs')) || [];
    let currentConfigIndex = null;

    // JSON Schema Validator
    const ajv = new Ajv();

    // Schema for VLESS and VMESS
    const v2raySchema = {
        type: "object",
        properties: {
            protocol: { type: "string", enum: ["vless", "vmess"] },
            settings: { type: "object" },
            streamSettings: { type: "object" },
        },
        required: ["protocol", "settings", "streamSettings"],
    };

    // Render Configs
    function renderConfigs() {
        configList.innerHTML = '';
        configs.forEach((config, index) => {
            const configItem = document.createElement('div');
            configItem.className = 'p-4 bg-white rounded-lg shadow-md cursor-pointer hover:bg-gray-50';
            configItem.textContent = config.name;
            configItem.addEventListener('click', () => editConfig(index));
            configList.appendChild(configItem);
        });
    }

    // Edit Config
    function editConfig(index) {
        currentConfigIndex = index;
        const config = configs[index];
        configNameInput.value = config.name;
        configContentInput.value = JSON.stringify(config.content, null, 2);
        configEditor.classList.remove('hidden');
    }

    // Save Config
    function saveConfig() {
        const name = configNameInput.value;
        let content;
        try {
            content = JSON.parse(configContentInput.value);
        } catch (e) {
            alert('Invalid JSON format!');
            return;
        }

        const isValid = ajv.validate(v2raySchema, content);
        if (!isValid) {
            alert('Invalid V2Ray configuration: ' + ajv.errorsText());
            return;
        }

        if (currentConfigIndex !== null) {
            configs[currentConfigIndex] = { name, content };
        } else {
            configs.push({ name, content });
        }
        saveToLocalStorage();
        renderConfigs();
        cancelEdit();
    }

    // Cancel Edit
    function cancelEdit() {
        currentConfigIndex = null;
        configNameInput.value = '';
        configContentInput.value = '';
        configEditor.classList.add('hidden');
    }

    // Save to localStorage
    function saveToLocalStorage() {
        localStorage.setItem('v2ray-configs', JSON.stringify(configs));
    }

    // Import Config
    importConfigBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedConfigs = JSON.parse(e.target.result);
                    configs = importedConfigs;
                    saveToLocalStorage();
                    renderConfigs();
                } catch (e) {
                    alert('Invalid file format!');
                }
            };
            reader.readAsText(file);
        }
    });

    // Export Config
    exportConfigBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(configs, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'v2ray-configs.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Event Listeners
    addConfigBtn.addEventListener('click', () => {
        currentConfigIndex = null;
        configNameInput.value = '';
        configContentInput.value = '';
        configEditor.classList.remove('hidden');
    });

    saveConfigBtn.addEventListener('click', saveConfig);
    cancelEditBtn.addEventListener('click', cancelEdit);

    renderConfigs();
});
