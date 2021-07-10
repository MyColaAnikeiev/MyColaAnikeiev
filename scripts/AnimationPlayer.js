var AnimationPlayer;
(function (AnimationPlayer) {
    let frames;
    let flags;
    let html;
    function setProject(pg) {
        flags = pg.flags;
        html = pg.html;
    }
    AnimationPlayer.setProject = setProject;
    function setAnimation(anim) {
        frames = anim.frames;
    }
    AnimationPlayer.setAnimation = setAnimation;
    let handlersIsSetUp = false;
    let isRunning = false;
    let intervalId;
    let showOnlyLast = 5;
    let currentFrameInd = 0;
    let playAllFrames = false;
    function start() {
        if (!handlersIsSetUp)
            setUpControlHandlers();
        if (isRunning)
            stop();
        isRunning = true;
        intervalId = setInterval(next, 300);
        currentFrameInd = frames.frameDeltas.length - showOnlyLast;
        if (currentFrameInd < 0)
            currentFrameInd = 0;
    }
    AnimationPlayer.start = start;
    function stop() {
        clearInterval(intervalId);
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
        if (currentFrameInd >= framesCount) {
            if (playAllFrames) {
                currentFrameInd = 0;
                return;
            }
            currentFrameInd = framesCount - showOnlyLast;
            if (currentFrameInd < 0) {
                currentFrameInd = 0;
            }
        }
    }
    function setUpControlHandlers() {
        handlersIsSetUp = true;
        function btnHandler(num) {
            return function (e) {
                playAllFrames = false;
                showOnlyLast = num;
                html.animPreviewControls.frameNumInput.valueAsNumber = num;
            };
        }
        html.animPreviewControls.showLast.onclick = btnHandler(1);
        html.animPreviewControls.showLast2.onclick = btnHandler(2);
        html.animPreviewControls.showLast3.onclick = btnHandler(3);
        html.animPreviewControls.showAll.onclick = () => playAllFrames = true;
        html.animPreviewControls.frameNumInput.oninput = function (evt) {
            let input = evt.target;
            let val = input.valueAsNumber;
            if (val > 0) {
                playAllFrames = false;
                showOnlyLast = val;
            }
        };
    }
})(AnimationPlayer || (AnimationPlayer = {}));
