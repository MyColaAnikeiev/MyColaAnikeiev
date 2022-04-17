/* All canvas renderings is here */
var RTools;
(function (RTools) {
    const background_frame_color = "#111";
    const background_color = "#444";
    const minCanvasWidth = 320;
    const minCanvasHeight = 160;
    RTools.canvasPadding = 10;
    let ctx;
    let canvas;
    let preview_ctx;
    let preview_canvas;
    let width = 0;
    let height = 0;
    let spriteImg;
    /* Setters */
    function setCanvas(el) {
        canvas = el;
    }
    RTools.setCanvas = setCanvas;
    function setContext(context) {
        ctx = context;
    }
    RTools.setContext = setContext;
    function setPreviewCanvas(el) {
        preview_canvas = el;
    }
    RTools.setPreviewCanvas = setPreviewCanvas;
    function setPreviewContext(ctx) {
        preview_ctx = ctx;
    }
    RTools.setPreviewContext = setPreviewContext;
    function setImg(img) {
        spriteImg = img;
        width = spriteImg.width;
        height = spriteImg.height;
    }
    RTools.setImg = setImg;
    function drawMarkup(width, height) {
        if (width < minCanvasWidth || height < minCanvasHeight) {
            width = minCanvasWidth;
            height = minCanvasHeight;
        }
        /* Background frame*/
        ctx.fillStyle = background_frame_color;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = background_color;
        ctx.fillRect(RTools.canvasPadding, RTools.canvasPadding, width - RTools.canvasPadding * 2, height - RTools.canvasPadding * 2);
    }
    RTools.drawMarkup = drawMarkup;
    function drawImage() {
        canvas.setAttribute('width', String(width + RTools.canvasPadding * 2));
        canvas.setAttribute('height', String(height + RTools.canvasPadding * 2));
        ctx.fillStyle = background_frame_color;
        ctx.fillRect(0, 0, width + RTools.canvasPadding * 2, height + RTools.canvasPadding * 2);
        ctx.drawImage(spriteImg, 0, 0, width, height, RTools.canvasPadding, RTools.canvasPadding, width, height);
    }
    RTools.drawImage = drawImage;
    function drawFrameBox(x, y, width, height, color = "#a0ffa080") {
        x = Math.round(x);
        y = Math.round(y);
        width = Math.round(width);
        height = Math.round(height);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.moveTo(x - 1, y - 1);
        ctx.lineTo(x + width + 1, y - 1);
        ctx.lineTo(x + width + 1, y + height + 1);
        ctx.lineTo(x - 1, y + height + 1);
        ctx.lineTo(x - 1, y - 1);
        ctx.stroke();
    }
    function drawMiddlePoint(x, y, midPoint) {
        x += midPoint.x;
        y += midPoint.y;
        ctx.beginPath();
        ctx.strokeStyle = "#60ff3074";
        ctx.moveTo(x - 5, y);
        ctx.lineTo(x + 5, y);
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x, y + 5);
        ctx.stroke();
    }
    function drawFrameBoxes(frames, selected = -1) {
        drawImage();
        let base = frames.baseBox;
        let deltas = frames.frameDeltas;
        let xShift = base.left + RTools.canvasPadding;
        let yShift = base.top + RTools.canvasPadding;
        //selected = selected == -1 ? deltas.length - 1 : selected;
        for (let i = 0; i < deltas.length; i++) {
            //let last = deltas.length - 1 == i;
            let d = deltas[i];
            xShift += d.xShift;
            yShift += d.yShift;
            if (d.crop.top || d.crop.right || d.crop.bottom || d.crop.left) {
                // Outline
                drawFrameBox(xShift, yShift, base.width, base.height, selected == i ? "#a05ff050" : "#005ff050");
                drawCropedArea(base, { left: xShift, top: yShift }, d.crop, selected == i ? "#a059f050" : "#005ff050");
            }
            drawFrameBox(xShift + d.crop.left, yShift + d.crop.top, base.width - (d.crop.left + d.crop.right), base.height - (d.crop.top + d.crop.bottom), selected == i ? "#ff1a5090" : "#a0ffa080");
            if (base.middlePoint) {
                drawMiddlePoint(xShift, yShift, base.middlePoint);
            }
        }
    }
    RTools.drawFrameBoxes = drawFrameBoxes;
    function drawCropedArea(base, pos, crop, color = "#005ff050") {
        ctx.fillStyle = color;
        ctx.fillRect(pos.left, pos.top, base.width, crop.top);
        ctx.fillRect(pos.left, pos.top + base.height - crop.bottom, base.width, crop.bottom);
        ctx.fillRect(pos.left, pos.top + crop.top, crop.left, base.height - crop.top - crop.bottom);
        ctx.fillRect(pos.left + base.width - crop.right, pos.top + crop.top, crop.right, base.height - crop.top - crop.bottom);
    }
    /* Show frame by index in preview canvas. */
    /* Base box image sample will be resized to fit in preview canvas as a whole.*/
    function showFrame(frames, ind) {
        let pWidth = preview_canvas.width;
        let pHeight = preview_canvas.height;
        let pRatio = pWidth / pHeight;
        let { crop } = frames.frameDeltas[ind];
        let fWidth = frames.baseBox.width;
        let fHeight = frames.baseBox.height;
        // Apply crop
        let cWidth = fWidth - (crop.left + crop.right);
        let cHeight = fHeight - (crop.top + crop.bottom);
        let fRatio = fWidth / fHeight;
        /* Fill background */
        preview_ctx.fillStyle = background_color;
        preview_ctx.fillRect(0, 0, pWidth, pHeight);
        let position = getFrameAbsolutePosition(frames, ind);
        let bb = frames.baseBox;
        if (pRatio > fRatio) {
            let wRatio = fRatio / pRatio;
            let scale = pHeight / fHeight;
            let gap = (1 - wRatio) / 2 * pWidth;
            preview_ctx.drawImage(spriteImg, position.left + crop.left, position.top + crop.top, cWidth, cHeight, gap + crop.left * scale, crop.top * scale, pWidth * wRatio - (crop.left + crop.right) * scale, pHeight - (crop.top + crop.bottom) * scale);
        }
        else {
            let hRatio = pRatio / fRatio;
            let gap = (1 - hRatio) / 2 * pHeight;
            let scale = pWidth / fWidth;
            preview_ctx.drawImage(spriteImg, position.left + crop.left, position.top + crop.top, cWidth, cHeight, crop.left * scale, gap + crop.top * scale, pWidth - (crop.left + crop.right) * scale, pHeight * hRatio - (crop.top + crop.bottom) * scale);
        }
    }
    RTools.showFrame = showFrame;
    function getFrameAbsolutePosition(frames, ind) {
        let x = frames.baseBox.left;
        let y = frames.baseBox.top;
        for (let i = 0; i <= ind; i++) {
            x += frames.frameDeltas[i].xShift;
            y += frames.frameDeltas[i].yShift;
        }
        return { left: x, top: y };
    }
    function fromFrameImageToSheet(ctx, base, crop, targetPos) {
        ctx.drawImage(spriteImg, base.x + crop.left, base.y + crop.top, base.width - crop.left - crop.right, base.height - crop.top - crop.bottom, targetPos.x + crop.left, targetPos.y + crop.top, base.width - crop.left - crop.right, base.height - crop.top - crop.bottom);
    }
    RTools.fromFrameImageToSheet = fromFrameImageToSheet;
})(RTools || (RTools = {}));
