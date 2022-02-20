import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";
import { BoundingBox } from "../models/textDetection";

type BoxElementProps = {
  box: BoundingBox;
  isSelected: boolean;
  fillColor: string;
  opacity: number;
  onSelect: () => void;
  onChange: (changedBox: BoundingBox) => void;
  setSelectedBoxID: React.Dispatch<React.SetStateAction<string | null>>;
  dragMoveHandler: (event: KonvaEventObject<DragEvent>) => void;
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
};

function BoxElement(props: BoxElementProps) {
  const shapeRef = useRef<Konva.Rect>(null!);
  const trRef = useRef<Konva.Transformer>(null!);

  useEffect(() => {
    if (props.isSelected) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [props.isSelected]);

  const transformEndHandler = (e: KonvaEventObject<Event>) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    props.onChange(
      new BoundingBox(
        node.x(),
        node.y(),
        Math.max(5, node.width() * scaleX),
        Math.max(node.height() * scaleY),
        node.rotation()
      )
    );
    props.setSelectedBoxID(null);
  };

  return (
    <>
      <Rect
        ref={shapeRef}
        id={props.box.id}
        x={props.box.x}
        y={props.box.y}
        width={props.box.width}
        height={props.box.height}
        rotation={props.box.rotation}
        fill={props.fillColor}
        draggable={true}
        opacity={props.opacity}
        onClick={props.onSelect}
        onTap={props.onSelect}
        onDragMove={props.dragMoveHandler}
        onDragEnd={props.dragEndHandler}
        onTransformEnd={transformEndHandler}
      />
      {props.isSelected && <Transformer ref={trRef} />}
    </>
  );
}

export default BoxElement;
