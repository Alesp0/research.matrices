import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

type DocumentStatusProps = {
  imageName: string;
  isLoading: boolean;
  onSegmentationClick: () => void;
};

function DocumentStatus(props: DocumentStatusProps) {
  return (
    <Container>
      <Stack direction="horizontal">
        <div>{props.imageName}</div>
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
