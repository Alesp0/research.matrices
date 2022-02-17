import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import { BoundingBox } from "../models/textDetection";

type DocumentStatusProps = {
  imageName: string;
  isLoading: boolean;
  onSegmentationClick: () => void;
  onSendToOcrClick: () => void;
  drawRectAllowed: boolean;
  setDrawRectAllowed: React.Dispatch<React.SetStateAction<boolean>>;
  segmentationData?: BoundingBox[];
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
        {boxesInfo}

        <Button
          variant="primary"
          disabled={props.drawRectAllowed}
          onClick={handleAllowDrawClick}
        >
          Draw Box
        </Button>

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
            className="ms-auto"
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
