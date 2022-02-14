import { Stage, Layer, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";

import { BoundingBox } from "../models/textDetection";
import BoxElement from "./BoxElement";

type ImageCanvasProps = {
  imageSrc: string;
  boundingBoxes?: BoundingBox[];
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [image] = useImage(props.imageSrc);
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
        strokeColor="blue"
      />
    );
  });

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Image image={image} />
        <Group>{boxElems}</Group>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
