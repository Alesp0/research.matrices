import { useState } from "react";
import { Stage, Layer, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import { BoundingBox } from "../models/textDetection";
import BoxElement from "./BoxElement";

type ImageCanvasProps = {
  imageSrc: HTMLImageElement;
  imageWidth: number;
  imageHeight: number;
  boundingBoxes?: BoundingBox[];
  setBoundingBoxes: React.Dispatch<React.SetStateAction<BoundingBox[]>>;
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [selectedBoxID, setSelectedBoxID] = useState<string | null>(null);

  let boxes: BoundingBox[] = [];
  if (props.boundingBoxes) {
    boxes = props.boundingBoxes;
  }

  const boxElems = boxes.map((box, index) => {
    return (
      <BoxElement
        key={box.id}
        box={box}
        isSelected={selectedBoxID === box.id}
        onSelect={() => {
          setSelectedBoxID(box.id);
        }}
        onChange={(newBox) => {
          props.setBoundingBoxes((previusState) => {
            const nextState = previusState.slice();
            nextState[index] = newBox;
            return nextState;
          });
        }}
        dragEndHandler={props.dragEndHandler}
        strokeColor="#dd00ff"
        strokeWidth={2}
        fillColor="#dd00ff"
        opacity={0.3}
      />
    );
  });

  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedBoxID(null);
    }
  };

  return (
    <Stage
      width={props.imageWidth}
      height={props.imageHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
    >
      <Layer>
        <Image image={props.imageSrc} />
        <Group>{boxElems}</Group>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
