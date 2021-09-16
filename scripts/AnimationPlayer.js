var AnimationPlayer;
(function (AnimationPlayer) {
    let frames;
    let flags;
    let html;
    let handlersIsSetUp = false;
    let isRunning = false;
    let timeoutId;
    let showOnlyLast = 5;
    let currentFrameInd = 0;
    let playUntillSelected = false;
    let selectedFrameId = null;
    let timeInterval = 300;
    let playAllFrames = false;
    function log(...a) { console.log(...a); }
    function setProject(pg) {
        flags = pg.flags;
        html = pg.html;
        init();
    }
    AnimationPlayer.setProject = setProject;
    function setAnimation(anim) {
        if (anim.frames == frames) {
            return;
        }
        frames = anim.frames;
        if (isRunning) {
            stop();
            start();
        }
    }
    AnimationPlayer.setAnimation = setAnimation;
    function init() {
        playUntillSelected = html.animPreviewControls
            .untillSelectedCheckbox.checked;
    }
    function selectedFrameSet(num) {
        selectedFrameId = num;
        stop();
        start();
    }
    AnimationPlayer.selectedFrameSet = selectedFrameSet;
    function selectedFrameUnset() {
        selectedFrameId = null;
        stop();
        start();
    }
    AnimationPlayer.selectedFrameUnset = selectedFrameUnset;
    function start() {
        if (!handlersIsSetUp)
            setUpControlHandlers();
        if (isRunning)
            stop();
        isRunning = true;
        if (!playUntillSelected || selectedFrameId === null) {
            currentFrameInd = frames.frameDeltas.length - showOnlyLast;
        }
        else {
            currentFrameInd = selectedFrameId + 1 - showOnlyLast;
        }
        if (currentFrameInd < 0) {
            currentFrameInd = 0;
        }
        next();
    }
    AnimationPlayer.start = start;
    function stop() {
        clearTimeout(timeoutId);
        isRunning = false;
    }
    AnimationPlayer.stop = stop;
    function next() {
        let framesCount = frames.frameDeltas.length;
        // In case if frame number is reduced
        if (framesCount <= currentFrameInd) {
            currentFrameInd = framesCount - 1;
        }
        RTools.showFrame(frames, currentFrameInd);
        currentFrameInd++;
        if (currentFrameInd >= framesCount ||
            (selectedFrameId !== null &&
                playUntillSelected &&
                currentFrameInd >= (selectedFrameId + 1))) {
            if (playAllFrames) {
                currentFrameInd = 0;
                return;
            }
            if (!playUntillSelected || selectedFrameId === null) {
                currentFrameInd = framesCount - showOnlyLast;
            }
            else {
                currentFrameInd = selectedFrameId + 1 - showOnlyLast;
            }
            if (currentFrameInd < 0) {
                currentFrameInd = 0;
            }
        }
        timeoutId = setTimeout(next, timeInterval);
    }
    function setUpControlHandlers() {
        handlersIsSetUp = true;
        function btnHandler(num) {
            return function (e) {
                playAllFrames = false;
                showOnlyLast = num;
                html.animPreviewControls.frameNumInput.valueAsNumber = num;
                stop();
                start();
            };
        }
        html.animPreviewControls.showLast.onclick = btnHandler(1);
        html.animPreviewControls.showLast2.onclick = btnHandler(2);
        html.animPreviewControls.showLast3.onclick = btnHandler(3);
        html.animPreviewControls.showAll.onclick = () => {
            html.animPreviewControls.frameNumInput.value = '';
            playAllFrames = true;
            stop();
            start();
        };
        html.animPreviewControls.frameNumInput.oninput = function (evt) {
            let input = evt.target;
            let val = input.valueAsNumber;
            if (val > 0) {
                playAllFrames = false;
                showOnlyLast = val;
            }
        };
        html.animPreviewControls.untillSelectedCheckbox.oninput = (e) => {
            playUntillSelected = e.target.checked;
            stop();
            start();
        };
    }
})(AnimationPlayer || (AnimationPlayer = {}));
