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
  drawRectAllowed: boolean;
  setDrawRectAllowed: React.Dispatch<React.SetStateAction<boolean>>;
  setBoundingBoxes: React.Dispatch<React.SetStateAction<BoundingBox[]>>;
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [selectedBoxID, setSelectedBoxID] = useState<string | null>(null);

  const [newBoxToAdd, setNewBoxToAdd] = useState<BoundingBox | null>(null);

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
        strokeColor="#0d1680"
        strokeWidth={4}
        fillColor="#ab0a60"
        opacity={0.3}
      />
    );
  });

  const handleMouseDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const clickedOnEmpty = event.target.getClassName() === "Image";
    if (clickedOnEmpty) {
      setSelectedBoxID(null);
    }

    if (props.drawRectAllowed) {
      const vec2d = event.target.getStage()?.getPointerPosition();
      if (vec2d) {
        const { x, y } = vec2d;
        setNewBoxToAdd(new BoundingBox(x, y, 0, 0));
      }
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (newBoxToAdd) {
      const vec2d = event.target.getStage()?.getPointerPosition();
      if (vec2d) {
        const { x, y } = vec2d;
        const toAdd = new BoundingBox(
          newBoxToAdd.x,
          newBoxToAdd.y,
          x - newBoxToAdd.x,
          y - newBoxToAdd.y
        );
        setNewBoxToAdd(null);
        props.setBoundingBoxes((previusState) => {
          return [...previusState, toAdd];
        });
      }
    }
    props.setDrawRectAllowed(false);
  };

  const handleMouseMove = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (newBoxToAdd) {
      const vec2d = event.target.getStage()?.getPointerPosition();
      if (vec2d) {
        const { x, y } = vec2d;
        setNewBoxToAdd(
          new BoundingBox(
            newBoxToAdd.x,
            newBoxToAdd.y,
            x - newBoxToAdd.x,
            y - newBoxToAdd.y
          )
        );
      }
    }
  };

  return (
    <Stage
      width={props.imageWidth}
      height={props.imageHeight}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
    >
      <Layer>
        <Image image={props.imageSrc} />
      </Layer>
      <Layer>
        <Group>{boxElems}</Group>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
