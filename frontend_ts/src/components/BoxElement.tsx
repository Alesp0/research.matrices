import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { useEffect, useRef } from "react";
import { Rect, Transformer } from "react-konva";
import { BoundingBox } from "../models/textDetection";

type BoxElementProps = {
  box: BoundingBox;
  dragEndHandler: (event: KonvaEventObject<DragEvent>) => void;
  //transformEndHandler: (event: KonvaEventObject<Event>) => void;
  strokeColor: string;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (changedBox: BoundingBox) => void;
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
        props.box.id,
        Math.max(node.height() * scaleY),
        Math.max(5, node.width() * scaleX),
        node.x(),
        node.y()
      )
    );
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
        stroke={props.strokeColor}
        strokeWidth={1}
        onDragEnd={props.dragEndHandler}
        onClick={props.onSelect}
        onTap={props.onSelect}
        onTransformEnd={transformEndHandler}
        draggable={true}
      />
      {props.isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default BoxElement;
