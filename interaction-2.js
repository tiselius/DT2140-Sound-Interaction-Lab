//==========================================================================================
// AUDIO SETUP
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit just where you're asked to!
//------------------------------------------------------------------------------------------
//
//==========================================================================================
let dspNode = null;
let dspNodeParams = null;
let jsonParams = null;

// Change here to ("tuono") depending on your wasm file name
const dspName = "bells";
const instance = new FaustWasm2ScriptProcessor(dspName);

// output to window or npm package module
if (typeof module === "undefined") {
    window[dspName] = instance;
} else {
    const exp = {};
    exp[dspName] = instance;
    module.exports = exp;
}

// The name should be the same as the WASM file, so change tuono with brass if you use brass.wasm
bells.createDSP(audioContext, 1024)
    .then(node => {
        dspNode = node;
        dspNode.connect(audioContext.destination);
        console.log('params: ', dspNode.getParams());
        const jsonString = dspNode.getJSON();
        jsonParams = JSON.parse(jsonString)["ui"][0]["items"];
        dspNodeParams = jsonParams
        // const exampleMinMaxParam = findByAddress(dspNodeParams, "/thunder/rumble");
        // // ALWAYS PAY ATTENTION TO MIN AND MAX, ELSE YOU MAY GET REALLY HIGH VOLUMES FROM YOUR SPEAKERS
        // const [exampleMinValue, exampleMaxValue] = getParamMinMax(exampleMinMaxParam);
        // console.log('Min value:', exampleMinValue, 'Max value:', exampleMaxValue);
    });


//==========================================================================================
// INTERACTIONS
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit the next functions to create interactions
// Decide which parameters you're using and then use playAudio to play the Audio
//------------------------------------------------------------------------------------------
//
//==========================================================================================

let maxShakeForce = 0;

function accelerationChange(accx, accy, accz) {
    const totalForce = Math.sqrt(accx * accx + accy * accy + accz * accz);
    // if (totalForce > maxShakeForce) {
        maxShakeForce = totalForce;
    // }
}

function rotationChange(rotx, roty, rotz) {
}

function mousePressed() {
    playAudio(15);
    // Use this for debugging from the desktop!
}

function deviceMoved() {
    movetimer = millis();
    statusLabels[2].style("color", "pink");
}

function deviceTurned() {
    threshVals[1] = turnAxis;
}

function deviceShaken() {
    shaketimer = millis();
    statusLabels[0].style("color", "pink");
    playAudio(maxShakeForce);
    maxShakeForce = 0;
}



//==========================================================================================
// AUDIO INTERACTION
//------------------------------------------------------------------------------------------
//
//------------------------------------------------------------------------------------------
// Edit here to define your audio controls 
//------------------------------------------------------------------------------------------
//
//==========================================================================================

function playAudio(shakeForce = 15) {
    if (!dspNode) {
        return;
  }
    if (audioContext.state === 'suspended') {
        return;
    }

    // Map shake force (roughly 5 for light shake up to 35 for hard shake) to volume (0.1 to 1.0)
    // p5.js constrain() and map() keep the volume safely within [0.1, 1.0]
    const volume = constrain(map(shakeForce, 1, 10, 0.1, 1.0), 0.1, 1.0);

    // Check your browser console's 'params:' log to verify whether bells.wasm uses
    // "/englishBell/gain", "/englishBell/volume", or "/englishBell/strikeSharpness"
    dspNode.setParamValue("/englishBell/gain", volume);

    // Trigger the bell
    dspNode.setParamValue("/englishBell/gate", 1);
    setTimeout(() => { dspNode.setParamValue("/englishBell/gate", 0) }, 100);
}

//==========================================================================================
// END
//==========================================================================================

