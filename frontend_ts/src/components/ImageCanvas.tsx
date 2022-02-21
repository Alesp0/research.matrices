import { useState } from "react";
import { Stage, Layer, Image, Group } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";

import BoundingBox from "../models/BoundingBox";
import BoxElement from "./BoxElement";

type ImageCanvasProps = {
  imageSrc: HTMLImageElement;
  imageWidth: number;
  imageHeight: number;
  boundingBoxes?: BoundingBox[];
  fillColor: string;
  opacityValue: number;
  selectedBoxID: string | null;
  drawRectAllowed: boolean;
  setSelectedBoxID: React.Dispatch<React.SetStateAction<string | null>>;
  setDrawRectAllowed: React.Dispatch<React.SetStateAction<boolean>>;
  setBoundingBoxes: React.Dispatch<React.SetStateAction<BoundingBox[]>>;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [newBoxToAdd, setNewBoxToAdd] = useState<BoundingBox | null>(null);

  let boxes: BoundingBox[] = [];
  if (props.boundingBoxes) {
    boxes = props.boundingBoxes;
  }

  const dragMoveHandler = (e: KonvaEventObject<DragEvent>) => {
    const box = e.target.getClientRect();
    const stageSize = e.target.getStage()!.getSize();
    const stageWidth = stageSize.width;
    const stageHeight = stageSize.height;

    if (
      box.x <= 0 ||
      box.y <= 0 ||
      box.x + box.width >= stageWidth ||
      box.y + box.height >= stageHeight
    ) {
      e.target.stopDrag();
    }
  };

  const dragEndHandler = (e: KonvaEventObject<DragEvent>) => {
    props.setBoundingBoxes((previousState) => {
      const newState = [...previousState].map((box) => {
        if (box.id === e.target.id()) {
          return new BoundingBox(
            e.target.x(),
            e.target.y(),
            box.width,
            box.height,
            box.rotation
          );
        } else {
          return box;
        }
      });
      return BoundingBox.sortBoxes(newState);
    });
  };

  const boxElems = boxes.map((box, index) => {
    return (
      <BoxElement
        key={box.id}
        box={box}
        isSelected={props.selectedBoxID === box.id}
        fillColor={props.fillColor}
        opacity={props.opacityValue}
        onSelect={() => {
          props.setSelectedBoxID(box.id);
        }}
        onChange={(newBox) => {
          props.setBoundingBoxes((previusState) => {
            const nextState = previusState.slice();
            nextState[index] = newBox;
            return BoundingBox.sortBoxes(nextState);
          });
        }}
        dragMoveHandler={dragMoveHandler}
        dragEndHandler={dragEndHandler}
        setSelectedBoxID={props.setSelectedBoxID}
      />
    );
  });

  const handleMouseDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    const clickedOnEmpty = event.target.getClassName() === "Image";
    if (clickedOnEmpty) {
      props.setSelectedBoxID(null);
    }

    if (props.drawRectAllowed) {
      const vec2d = event.target.getStage()?.getPointerPosition();
      if (vec2d) {
        const { x, y } = vec2d;
        setNewBoxToAdd(new BoundingBox(x, y, 0, 0, 0));
      }
    }
  };

  const handleMouseUp = (event: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (newBoxToAdd) {
      const vec2d = event.target.getStage()?.getPointerPosition();
      if (vec2d) {
        const { x, y } = vec2d;
        const newWidth = x - newBoxToAdd.x;
        const newHeight = y - newBoxToAdd.y;

        const toAdd = new BoundingBox(
          newBoxToAdd.x,
          newBoxToAdd.y,
          newWidth,
          newHeight,
          0
        );
        setNewBoxToAdd(null);
        props.setBoundingBoxes((previusState) => {
          return BoundingBox.sortBoxes([...previusState, toAdd]);
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
            y - newBoxToAdd.y,
            0
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

        <Group>{boxElems}</Group>
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
