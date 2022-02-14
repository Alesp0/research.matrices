import { KonvaEventObject } from "konva/lib/Node";
import { Rect } from "react-konva";
import { BoundingBox } from "../models/textDetection";

type BoxElementProps = {
  box: BoundingBox;
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
  strokeColor: string;
};

function BoxElement(props: BoxElementProps) {
  return (
    <Rect
      id={props.box.id}
      x={props.box.x}
      y={props.box.y}
      width={props.box.width}
      height={props.box.height}
      stroke={props.strokeColor}
      strokeWidth={1}
      onDragEnd={props.dragEndHandler}
      draggable={true}
    />
  );
}

export default BoxElement;
