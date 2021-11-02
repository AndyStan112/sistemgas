import { NextPage } from "next";
import image from "next/image";
import React, { useRef, useEffect, useState } from "react";
import canvas from "./canvas.module.css";
import CanvasText, {
  FinalText,
  FontConfigurationsProps,
} from "./TextCustomizations";

interface Props {
  width: number;
  height: number;
}
interface TextProps {
  payload: string;
  fontSize: number;
}

interface Canvas extends HTMLCanvasElement {
  context: CanvasRenderingContext2D;
}

interface CanvasImage {
  image: HTMLImageElement;
  width: number;
  height: number;
  displayX: number;
  displayY?: 0;
  displayWidth: number;
  displayHeight: number;
  draw: (x: number) => void;
}

const draw = (
  allTexts: FinalText[],
  image: HTMLImageElement,
  canvas: Canvas,
  x: number
): void => {
  const {
    height: canvasHeight,
    width: canvasWidth,
    context = canvas.getContext("2d") as CanvasRenderingContext2D,
  } = canvas;

  const { width: imageWidth, height: imageHeight } = image;
  // we clear the last image we draw on the canvas, so we don't get a cluttered canvas
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  // the rectangle will cover everything to the right of displayX, and it will move along side the car.

  if (Array.isArray(allTexts)) {
    allTexts.forEach((textValue) => {
      context.globalCompositeOperation = "destination-over";
      context.save();
      context.fillStyle = `${textValue.fontColor}`;
      context.font = `${textValue.fontSize}px ${textValue.fontFamily}`;
      context.fillText(
        `${textValue.payload}`,
        textValue.coordinates[0],
        textValue.coordinates[1]
      );
      context.globalCompositeOperation = "destination-out";
      context.fillRect(-canvasWidth + x + 50, 0, imageWidth, canvasHeight);
      context.restore();
    });
  }

  context.globalCompositeOperation = "source-over";

  context.drawImage(
    image,
    0,
    0,
    imageWidth,
    imageHeight,
    -canvasWidth + x,
    0,
    (imageWidth * canvasHeight) / imageHeight,
    canvasHeight
  );
};

const Canvas: NextPage<Props> = ({ width, height }) => {
  const canvasRef = useRef<Canvas>(null);

  /**
   * **time** is the way we are going to keep track of when we should re-draw an image. (control the framerate)
   * @member **elapsed** is the time between the **"start"** (that being the last repaint) and the current
   * timestamp. We initialize this with the same value as **duration** so we can have the first paint instantaneous.
   * @member  **start** is the timestamp of the most recent re-draw. The default value is -1 as we don't know when
   * the first paint will happen.
   * @member  **duration** is the time that should pass between two consecutive paints to achieve a
   * desired frame rate.
   */
  const time = {
    elapsed: 1000 / 144,
    start: -1,
    duration: 1000 / 144,
  };

  const fontSizeCustomizations: FontConfigurationsProps = {
    firstValueDefault: true,
    options: [50],
  };
  const fontColorCustomizations: FontConfigurationsProps = {
    firstValueDefault: true,
    options: ["black"],
  };
  const fontFamilyCustomizations: FontConfigurationsProps = {
    firstValueDefault: true,
    options: ["Arial", "Noto Sans Mono"],
    keywords: "alternativa",
  };

  const fontPadding: FontConfigurationsProps = {
    firstValueDefault: true,
    options: [20],
  };
  const title = new CanvasText(
    ["Solutia", "alternativa", "pentru", "furnizarea", "gazelor", "naturale"],
    fontSizeCustomizations,
    fontColorCustomizations,
    fontFamilyCustomizations,

    // TO DO : find better implementation for the padding
    fontPadding,

    [[200, 100], "right", "newline", "right", "right", "right"]
  );

  useEffect(() => {
    if (width && height) {
      const image = new Image() as HTMLImageElement;
      image.src = "/gas_truck.svg";
      const canvas = canvasRef.current as Canvas;
      canvas.width = width;
      canvas.height = height;
      const text = title.getFinalText(
        canvas.getContext("2d") as CanvasRenderingContext2D
      ) as FinalText[];
      /**
       * **x** will be used to update the position of the "car" on the canvas.
       */
      let x = 0;

      /**
       * **frameID** is will be a unique number that every requestAnimationFrame call will return.
       * We will need it in the cleanup function to stop the animation once the component is unmounted
       */
      let frameID: number;

      /**
       * The **render** function paints the browser at a certain framerate
       * @param now **now** is the timestamp that requestAnimationFrame passes to the callback (that being
       * the **render** function). In other words is the current timestamp
       */
      const render = (now: number) => {
        x += 4;

        // the first time the render function is called, we have no time.start, meaning time.elapsed will be negative
        // and this is not a behavior we intent for it. So if this is the case, time.elapsed will have it's default value
        // which is equal to the time.duration value. This way we make sure that the first paint is instantaneous.
        time.start ? (time.elapsed = now - time.start) : time.elapsed;

        if (time.elapsed >= time.duration) {
          time.start = now;
          draw(text, image, canvas, x);
        }
        frameID = window.requestAnimationFrame(render);
      };

      window.requestAnimationFrame(render);
    }

    // () => {
    //   // stopping the animation on umount
    //   window.cancelAnimationFrame(frameID);
    // };
  }, [width, height]);

  return <canvas ref={canvasRef} className={canvas.canvas}></canvas>;
};

export default Canvas;

// const drawImage = (
//   canvas: Canvas,
//   image: HTMLImageElement,
//   x: number
// ): void => {
//   const [centerX, computedWidth] = baseline(canvas, image);
//   const {
//     height: canvasHeight,
//     width: canvasWidth,
//     context = canvas.getContext("2d") as CanvasRenderingContext2D,
//   } = canvas;

//   const { width: imageWidth, height: imageHeight } = image;

//   context.clearRect(0, 0, canvasWidth, canvasHeight);
//   // context.fillStyle = "red";
//   // context.fillRect(0, 0, canvasWidth, canvasHeight);

//   context.globalCompositeOperation = "source-over";
//   context.drawImage(
//     image,
//     0,
//     0,
//     imageWidth,
//     imageHeight,
//     -canvasWidth + x,
//     0,
//     (imageWidth * canvasHeight) / imageHeight,
//     canvasHeight
//   );
//   // context.fillRect(-computedWidth + x, 0, 10, canvasHeight);
// };
