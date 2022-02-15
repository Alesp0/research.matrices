import { Stage, Layer, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import { BoundingBox } from "../models/textDetection";
import BoxElement from "./BoxElement";

type ImageCanvasProps = {
  imageSrc: HTMLImageElement;
  imageWidth: number;
  imageHeight: number;
  boundingBoxes?: BoundingBox[];
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
};

function ImageCanvas(props: ImageCanvasProps) {
  let boxes: BoundingBox[] = [];
  if (props.boundingBoxes) {
    boxes = props.boundingBoxes;
  }

  const boxElems = boxes.map((box) => {
    return (
      <BoxElement
        key={box.id}
        box={box}
        dragEndHandler={props.dragEndHandler}
        strokeColor="#dd00ff"
      />
    );
  });

  return (
    <Stage width={props.imageWidth} height={props.imageHeight}>
      <Layer>
        <Image image={props.imageSrc} />
        <Group>{boxElems}</Group>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
