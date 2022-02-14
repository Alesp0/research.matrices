import { Stage, Layer, Rect, Image } from "react-konva";
import useImage from "use-image";

import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";

type ImageCanvasProps = {
  imageSrc: string;
  boundingBoxesData?: TextDetectionResponseData;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [image] = useImage(props.imageSrc);
  let boxes: BoundingBox[] = [];

  if (props.boundingBoxesData) {
    boxes = props.boundingBoxesData.boundingBoxes;
  }

  const boxElements = boxes.map((box) => {
    return (
      <li key={box.id}>
        <Rect
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          stroke="blue"
          strokeWidth={3}
          draggable={true}
        />
      </li>
    );
  });

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Image image={image} />
        <ol>{boxElements}</ol>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
