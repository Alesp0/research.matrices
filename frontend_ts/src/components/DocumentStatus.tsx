import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import ColorPicker from "./ColorPicker";
import { BoundingBox } from "../models/textDetection";

type DocumentStatusProps = {
  imageName: string;
  isLoading: boolean;
  drawRectAllowed: boolean;
  fillColor: string;
  segmentationData?: BoundingBox[];
  selectedBoxID: string | null;
  handleFillColorChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteBoxClick: () => void;
  onSegmentationClick: () => void;
  onSendToOcrClick: () => void;
  setDrawRectAllowed: React.Dispatch<React.SetStateAction<boolean>>;
};

function DocumentStatus(props: DocumentStatusProps) {
  let boxes: BoundingBox[] = [];
  let boxesInfo = <></>;
  if (props.segmentationData) {
    boxes = props.segmentationData;
    boxesInfo = <div>{`segments:${boxes.length}`}</div>;
  }

  const handleAllowDrawClick = () => {
    props.setDrawRectAllowed(true);
  };

  return (
    <Container>
      <Stack gap={3} direction="horizontal">
        <div>{props.imageName}</div>
        <div className="vr" />

        {boxesInfo}
        <ColorPicker
          defaultFillColor={props.fillColor}
          handleColorChange={props.handleFillColorChange}
        />

        <Button
          variant="primary"
          disabled={props.drawRectAllowed}
          onClick={handleAllowDrawClick}
        >
          Draw Box
        </Button>
        <Button
          variant="primary"
          disabled={!Boolean(props.selectedBoxID)}
          onClick={props.onDeleteBoxClick}
        >
          Delete Box
        </Button>

        <div className="vr ms-auto" />
        {boxes.length === 0 && (
          <Button
            variant="primary"
            disabled={props.isLoading}
            onClick={!props.isLoading ? props.onSegmentationClick : undefined}
          >
            {props.isLoading ? "Loading..." : "Segmentation"}
          </Button>
        )}
        {boxes.length > 0 && (
          <Button
            variant="primary"
            disabled={props.isLoading}
            onClick={!props.isLoading ? props.onSendToOcrClick : undefined}
          >
            {props.isLoading ? "Loading..." : "Send to OCR"}
          </Button>
        )}
      </Stack>
    </Container>
  );
}

export default DocumentStatus;
