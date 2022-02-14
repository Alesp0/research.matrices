import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import {
  TextDetectionResponseData,
  BoundingBox,
} from "../models/textDetection";

type DocumentStatusProps = {
  imageName: string;
  isLoading: boolean;
  onSegmentationClick: () => void;
  segmentationData?: TextDetectionResponseData;
};

function DocumentStatus(props: DocumentStatusProps) {
  let boxes: BoundingBox[] = [];
  let boxesInfo = <></>;
  if (props.segmentationData) {
    boxes = props.segmentationData.boundingBoxes;
    boxesInfo = <div>{`segments:${boxes.length}`}</div>;
  }

  return (
    <Container>
      <Stack gap={4} direction="horizontal">
        <div>{props.imageName}</div>
        {boxesInfo}

        <Button
          className="ms-auto"
          variant="primary"
          disabled={props.isLoading}
          onClick={!props.isLoading ? props.onSegmentationClick : undefined}
        >
          {props.isLoading ? "Loading..." : "Segmentation"}
        </Button>
      </Stack>
    </Container>
  );
}

export default DocumentStatus;
