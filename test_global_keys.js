const { GlobalKeyboardListener } = require("node-global-key-listener");

console.log('🧪 Testing Ctrl+S detection...');
console.log('Press Ctrl+S to test, Ctrl+C to exit');
console.log('Only Ctrl+S combinations will be logged.');

const v = new GlobalKeyboardListener();

let comboDetected = false;

v.addListener(function (e, down) {
    // Reset the combo detection when either Ctrl or S is released
    if (e.state === 'UP' && (e.name === 'S' || e.name.includes('CTRL') || e.name.includes('META') || e.name.includes('CMD'))) {
        if (comboDetected) {
            console.log(`🔄 Reset: ${e.name} released`);
            comboDetected = false;
        }
    }
    
    // Detect Ctrl+S combination
    if (e.name === 'S' && e.state === 'DOWN' && !comboDetected) {
        // Check if any Control or Command key is currently pressed
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        const isCmdPressed = down['LEFT META'] || down['RIGHT META'] || down['LEFT CMD'] || down['RIGHT CMD'] || down['META'] || down['CMD'];
        
        console.log(`S pressed - Ctrl: ${isCtrlPressed}, Cmd: ${isCmdPressed}`);
        console.log(`Current keys down:`, Object.keys(down).filter(k => down[k]));
        
        if (isCtrlPressed || isCmdPressed) {
            console.log('🚀 CTRL+S DETECTED! ✅');
            console.log(`   Control keys pressed: ${Object.keys(down).filter(k => k.includes('CTRL') || k.includes('META') || k.includes('CMD')).join(', ')}`);
            console.log(`   Timestamp: ${new Date().toLocaleTimeString()}`);
            comboDetected = true; // Mark as detected to prevent repeats until reset
        }
    }
    
    // Exit on Ctrl+C
    if (e.name === 'C' && e.state === 'DOWN') {
        const isCtrlPressed = down['LEFT CTRL'] || down['RIGHT CTRL'] || down['CTRL'] || down['CONTROL'];
        const isCmdPressed = down['LEFT META'] || down['RIGHT META'] || down['LEFT CMD'] || down['RIGHT CMD'] || down['META'] || down['CMD'];
        
        if (isCtrlPressed || isCmdPressed) {
            console.log('Exiting...');
            process.exit(0);
        }
    }
});

console.log('✅ Listener started. Press Ctrl+S anywhere to test!'); 