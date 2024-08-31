const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'src');

function collectComponents(dir) {
    let components = [];
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            components = components.concat(collectComponents(filePath));
        } else if (file.endsWith('.vue')) {
            components.push(filePath);
        }
    });
    return components;
}

function isComponentUsed(componentPath, projectDir) {
    const componentName = path.basename(componentPath, '.vue');
    const files = fs.readdirSync(projectDir);
    for (const file of files) {
        const filePath = path.join(projectDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (isComponentUsed(componentPath, filePath)) {
                return true;
            }
        } else if (file.endsWith('.vue') || file.endsWith('.js') || file.endsWith('.ts')) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const regex = new RegExp(`\\b${componentName}\\b`, 'g');
            if (regex.test(content)) {
                return true;
            }
        }
    }
    return false;
}

function findUnusedComponents() {
    const components = collectComponents(projectDir);
    const unusedComponents = components.filter(component => !isComponentUsed(component, projectDir));
    return unusedComponents;
}

const unusedComponents = findUnusedComponents();
console.log('Unused components:', unusedComponents);