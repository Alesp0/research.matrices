import { Stage, Layer, Rect, Image } from "react-konva";
import useImage from "use-image";

type ImageCanvasProps = {
  imageSrc: string;
};

function ImageCanvas(props: ImageCanvasProps) {
  const [image] = useImage(props.imageSrc);
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Image image={image} />
        <Rect
          x={20}
          y={50}
          width={500}
          height={20}
          stroke="blue"
          strokeWidth={3}
          draggable={true}
        />
      </Layer>
    </Stage>
  );
}

export default ImageCanvas;
